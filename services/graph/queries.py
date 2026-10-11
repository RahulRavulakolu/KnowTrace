"""Knowledge graph query functions."""

from sqlalchemy.orm import Session

from backend.models.db import ChunkConcept, ContentChunk
from services.graph.dag import recursive_cte_dependents, recursive_cte_prerequisites


def get_concept_prerequisites(concept_id: str, db_session: Session) -> list[str]:
    """Return direct and transitive prerequisite IDs."""
    return recursive_cte_prerequisites(concept_id, db_session)


def get_concept_dependents(concept_id: str, db_session: Session) -> list[str]:
    """Return direct and transitive dependent IDs."""
    return recursive_cte_dependents(concept_id, db_session)


def get_concept_sources(concept_id: str, db_session: Session) -> list[ContentChunk]:
    """Return source chunks associated with a concept."""
    return [
        association.chunk
        for association in db_session.query(ChunkConcept)
        .filter(ChunkConcept.concept_id == concept_id)
        .all()
    ]
