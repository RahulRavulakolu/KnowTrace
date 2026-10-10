"""Focused tests for taxonomy, tagging, prerequisite DAGs, and graph APIs."""

from types import SimpleNamespace

from backend.models.db import (
    ChunkConcept,
    Concept,
    ContentChunk,
    Course,
    Prerequisite,
    Topic,
)
from services.graph.dag import break_cycles, detect_cycles
from services.graph.queries import get_concept_prerequisites
from services.ingestion import tagging


def test_taxonomy_build_and_constrained_tagging(db_session, monkeypatch) -> None:
    """Taxonomy hierarchy and valid chunk associations are persisted."""
    course = Course(owner_id="owner", title="Taxonomy course")
    db_session.add(course)
    db_session.commit()
    topic_payload = {
        "topics": [{
            "name": "Statistics",
            "subtopics": [{
                "name": "Regression",
                "concepts": [
                    {"name": "Linear Regression", "description": "Fit a line"},
                    {"name": "Residuals", "description": "Prediction errors"},
                ],
            }, {
                "name": "Diagnostics",
                "concepts": [
                    {"name": "Model Error", "description": "Error analysis"},
                    {"name": "Goodness of Fit", "description": "Fit quality"},
                ],
            }],
        }]
    }
    monkeypatch.setattr(tagging, "call_llm", lambda *args, **kwargs: SimpleNamespace(data=topic_payload))
    taxonomy = tagging.build_course_taxonomy(course.id, db_session)
    assert len(taxonomy["topic_ids"]) == 3
    assert len(taxonomy["concept_ids"]) == 4
    source = type("SourceStub", (), {"id": "source"})()
    chunk = ContentChunk(course_id=course.id, source_id=source.id, text="Fit a line", modality="text")
    db_session.add(chunk)
    db_session.commit()
    concept_id = taxonomy["concept_ids"][0]
    monkeypatch.setattr(tagging, "call_llm", lambda *args, **kwargs: SimpleNamespace(
        data={"tags": [{"chunk_id": str(chunk.id), "concept_id": concept_id, "relevance": 0.9}]}
    ))
    result = tagging.tag_chunks_constrained(course.id, db_session)
    assert result["tagged"] == 1
    assert db_session.query(ChunkConcept).count() == 1


def test_dag_cycle_breaking_and_recursive_cte(db_session) -> None:
    """Lowest-confidence cycle edges are removed and transitive prerequisites resolve."""
    edges = [
        {"concept_id": "b", "prerequisite_id": "a", "confidence": 0.9},
        {"concept_id": "c", "prerequisite_id": "b", "confidence": 0.8},
        {"concept_id": "a", "prerequisite_id": "c", "confidence": 0.1},
    ]
    assert detect_cycles(["a", "b", "c"], edges)
    assert not detect_cycles(["a", "b", "c"], break_cycles(edges))
    topic = Topic(course_id="course", name="Topic")
    db_session.add(topic)
    db_session.flush()
    a = Concept(topic_id=topic.id, name="A")
    b = Concept(topic_id=topic.id, name="B")
    c = Concept(topic_id=topic.id, name="C")
    db_session.add_all([a, b, c])
    db_session.flush()
    db_session.add_all([
        Prerequisite(concept_id=b.id, prerequisite_id=a.id, kind="requires"),
        Prerequisite(concept_id=c.id, prerequisite_id=b.id, kind="requires"),
    ])
    db_session.commit()
    assert set(get_concept_prerequisites(c.id, db_session)) == {a.id, b.id}


def test_graph_endpoint_returns_nodes_and_edges(client, db_session) -> None:
    """Course graph endpoint returns JSON graph collections."""
    course = Course(owner_id="owner", title="Graph course")
    db_session.add(course)
    db_session.commit()
    response = client.get(f"/courses/{course.id}/graph")
    assert response.status_code == 200
    assert {"nodes", "edges"} <= response.json().keys()
