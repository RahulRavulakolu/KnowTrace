"""Course taxonomy construction, constrained chunk tagging, and prerequisite mining."""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from sqlalchemy.orm import Session

from backend.core.llm import call_llm
from backend.core.logging import logger
from backend.models.db import (
    ChunkConcept,
    Concept,
    ContentChunk,
    Misconception,
    Prerequisite,
    Topic,
)
from services.ingestion.prompts import (
    P4_TAXONOMY_PROMPT,
    P5_TAGGING_PROMPT,
    P6_PREREQUISITE_PROMPT,
)


def _data(response: Any) -> dict[str, Any]:
    """Normalize an LLM response payload to a dictionary."""
    value = getattr(response, "data", response)
    return value if isinstance(value, dict) else {}


def _taxonomy_digest(db_session: Session, course_id: str, limit: int = 2000) -> str:
    """Build a compact digest from headings, slide titles, and transcript samples."""
    chunks = db_session.query(ContentChunk).filter(
        ContentChunk.course_id == course_id
    ).order_by(ContentChunk.created_at).all()
    lines: list[str] = []
    for index, chunk in enumerate(chunks):
        visual = chunk.visual or {}
        title = visual.get("title") or visual.get("caption")
        if title:
            lines.append(f"Heading: {title}")
        if chunk.slide and chunk.text:
            lines.append(f"Slide {chunk.slide}: {chunk.text[:500]}")
        elif chunk.modality == "transcript" and index % 10 == 0:
            lines.append(f"Transcript: {chunk.text[:600]}")
        elif chunk.text and not lines:
            lines.append(chunk.text[:600])
        if sum(len(line.split()) for line in lines) >= limit:
            break
    return "\n".join(lines)[: max(1000, limit * 6)]


def _valid_taxonomy(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Normalize taxonomy and enforce the requested hierarchy limits."""
    result: list[dict[str, Any]] = []
    for topic in payload.get("topics", [])[:10]:
        if not isinstance(topic, dict) or not topic.get("name"):
            continue
        subtopics: list[dict[str, Any]] = []
        raw_subtopics = topic.get("subtopics", [])
        if len(raw_subtopics) < 2:
            continue
        for subtopic in raw_subtopics[:5]:
            if not isinstance(subtopic, dict) or not subtopic.get("name"):
                continue
            raw_concepts = subtopic.get("concepts", [])
            if len(raw_concepts) < 2:
                continue
            concepts = [
                concept for concept in raw_concepts[:8]
                if isinstance(concept, dict) and concept.get("name")
            ]
            if concepts:
                subtopics.append({"name": str(subtopic["name"]), "concepts": concepts})
        if subtopics:
            result.append({"name": str(topic["name"]), "subtopics": subtopics})
    return result


def build_course_taxonomy(course_id: str, db_session: Session) -> dict[str, list[str]]:
    """Build and persist a bounded topic/subtopic/concept hierarchy."""
    digest = _taxonomy_digest(db_session, course_id)
    response = call_llm("A", f"{P4_TAXONOMY_PROMPT}\n\nDigest:\n{digest}", json_schema={
        "type": "object", "properties": {"topics": {"type": "array"}}
    })
    taxonomy = _valid_taxonomy(_data(response))
    if not taxonomy:
        return {"topic_ids": [], "concept_ids": []}
    topic_ids: list[str] = []
    concept_ids: list[str] = []
    for topic_data in taxonomy:
        topic = Topic(course_id=course_id, name=topic_data["name"])
        db_session.add(topic)
        db_session.flush()
        topic_ids.append(str(topic.id))
        for sub_data in topic_data["subtopics"]:
            subtopic = Topic(course_id=course_id, parent_id=topic.id, name=sub_data["name"])
            db_session.add(subtopic)
            db_session.flush()
            topic_ids.append(str(subtopic.id))
            for concept_data in sub_data["concepts"]:
                concept = Concept(
                    topic_id=subtopic.id,
                    name=str(concept_data["name"]),
                    description=concept_data.get("description"),
                    importance=float(concept_data.get("importance", 1.0)),
                )
                db_session.add(concept)
                db_session.flush()
                concept_ids.append(str(concept.id))
    db_session.commit()
    return {"topic_ids": topic_ids, "concept_ids": concept_ids}


def tag_chunks_constrained(course_id: str, db_session: Session) -> dict[str, Any]:
    """Tag every untagged chunk using only concepts belonging to the course."""
    chunks = db_session.query(ContentChunk).filter(
        ContentChunk.course_id == course_id,
        ~ContentChunk.concept_associations.any(),
    ).all()
    concepts = db_session.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
    concept_map = {str(concept.id): concept for concept in concepts}
    tagged = 0
    unassigned = 0
    for offset in range(0, len(chunks), 10):
        batch = chunks[offset:offset + 10]
        compact = [{"chunk_id": str(chunk.id), "text": chunk.text[:2000]} for chunk in batch]
        taxonomy = [{"id": key, "name": value.name} for key, value in concept_map.items()]
        try:
            response = call_llm(
                "A", f"{P5_TAGGING_PROMPT}\nConcepts: {taxonomy}\nChunks: {compact}",
                json_schema={"type": "object", "properties": {"tags": {"type": "array"}}},
            )
            tags = _data(response).get("tags", [])
        except Exception as exc:
            logger.warning("Chunk tagging batch failed: %s", exc)
            tags = []
        by_chunk: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for tag in tags:
            if (
                isinstance(tag, dict)
                and str(tag.get("chunk_id")) in {str(chunk.id) for chunk in batch}
                and str(tag.get("concept_id")) in concept_map
            ):
                by_chunk[str(tag["chunk_id"])].append(tag)
        for chunk in batch:
            valid_tags = by_chunk.get(str(chunk.id), [])
            if not valid_tags:
                unassigned += 1
                continue
            for tag in valid_tags:
                db_session.add(ChunkConcept(
                    chunk_id=chunk.id,
                    concept_id=str(tag["concept_id"]),
                    relevance=max(0.0, min(1.0, float(tag.get("relevance", 1.0)))),
                    role=str(tag.get("role", "primary")),
                ))
            tagged += 1
    db_session.commit()
    return {
        "total_chunks": len(chunks),
        "tagged": tagged,
        "unassigned": unassigned,
        "tag_accuracy_sample": None,
    }


def build_prerequisites(course_id: str, db_session: Session) -> dict[str, Any]:
    """Persist prerequisite and confusable relationships returned by the LLM."""
    concepts = db_session.query(Concept).join(Topic).filter(
        Topic.course_id == course_id
    ).order_by(Concept.created_at).all()
    ids = {str(concept.id) for concept in concepts}
    payload = [{"id": str(concept.id), "name": concept.name} for concept in concepts]
    response = call_llm(
        "A", f"{P6_PREREQUISITE_PROMPT}\nConcepts: {payload}",
        json_schema={"type": "object", "properties": {
            "prerequisites": {"type": "array"}, "confusables": {"type": "array"}
        }},
    )
    data = _data(response)
    edge_count = 0
    for edge in data.get("prerequisites", []):
        if not isinstance(edge, dict) or edge.get("concept_id") == edge.get("prerequisite_id"):
            continue
        if str(edge.get("concept_id")) not in ids or str(edge.get("prerequisite_id")) not in ids:
            continue
        db_session.add(Prerequisite(
            concept_id=str(edge["concept_id"]),
            prerequisite_id=str(edge["prerequisite_id"]),
            kind="requires",
            confidence=float(edge.get("confidence", 1.0)),
            weight=float(edge.get("confidence", 1.0)),
            rationale=edge.get("rationale"),
        ))
        edge_count += 1
    confusable_count = 0
    for pair in data.get("confusables", []):
        if not isinstance(pair, dict):
            continue
        left, right = str(pair.get("concept_id")), str(pair.get("related_concept_id"))
        if left not in ids or right not in ids or left == right:
            continue
        db_session.add(Prerequisite(
            concept_id=left, prerequisite_id=right, kind="confusable",
            confidence=float(pair.get("confidence", 1.0)),
            weight=float(pair.get("confidence", 1.0)),
            rationale=pair.get("description"),
        ))
        db_session.add(Misconception(
            concept_id=left,
            label=str(pair.get("label", "Confusable concepts")),
            description=str(pair.get("description", "These concepts are commonly confused.")),
        ))
        confusable_count += 1
    db_session.commit()
    return {"edges_count": edge_count, "confusable_pairs_count": confusable_count, "cycles_found": 0}
