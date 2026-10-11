"""Source-grounded assessment question generation."""

from __future__ import annotations

from typing import Any

from backend.core.llm import call_llm
from backend.models.db import ChunkConcept, Concept, ContentChunk
from services.assessment.prompts import P14_QUESTION_GENERATION


def _data(response: Any) -> dict[str, Any]:
    value = getattr(response, "data", response)
    return value if isinstance(value, dict) else {}


def generate_question(
    concept_id: str,
    type: str,
    target_difficulty: float,
    confusables: list[str] | None = None,
    db_session: Any = None,
) -> dict[str, Any]:
    """Generate a draft from the best available source chunk for a concept."""
    owns_session = db_session is None
    if owns_session:
        from backend.core.db import SessionLocal

        db_session = SessionLocal()
    try:
        concept = db_session.get(Concept, concept_id)
        if concept is None:
            raise ValueError("Concept not found")
        chunk = (
            db_session.query(ContentChunk)
            .join(ChunkConcept)
            .filter(ChunkConcept.concept_id == concept_id)
            .order_by(ChunkConcept.relevance.desc())
            .first()
        )
        if chunk is None:
            raise ValueError("No source chunk is linked to this concept")
        prompt = (
            f"{P14_QUESTION_GENERATION}\nConcept: {concept.name}\nDescription: {concept.description or ''}\n"
            f"Type: {type}\nTarget difficulty: {target_difficulty}\nKnown misconceptions: {confusables or []}\n"
            f"Source chunk ID: {chunk.id}\nSource:\n{chunk.text}"
        )
        response = call_llm("A", prompt, json_schema={"type": "object"})
        draft = _data(response)
        draft.setdefault("type", type)
        draft.setdefault("difficulty_estimate", target_difficulty)
        draft.setdefault("source_chunk_id", str(chunk.id))
        draft.setdefault("support_span", "")
        return draft
    finally:
        if owns_session:
            db_session.close()
