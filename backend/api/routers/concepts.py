"""Concept graph API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.db import get_db
from services.graph.queries import get_concept_sources

router = APIRouter(prefix="/concepts", tags=["Concepts"])


@router.get("/{concept_id}/sources")
def concept_sources(concept_id: str, db: Session = Depends(get_db)) -> dict:
    """Return linked content chunks with page, slide, and timestamp citations."""
    chunks = get_concept_sources(concept_id, db)
    if not chunks:
        return {"concept_id": concept_id, "sources": []}
    return {
        "concept_id": concept_id,
        "sources": [
            {
                "chunk_id": str(chunk.id),
                "text": chunk.text,
                "source_id": str(chunk.source_id),
                "citation": {
                    "page": chunk.page,
                    "slide": chunk.slide,
                    "ts_start": chunk.ts_start,
                    "ts_end": chunk.ts_end,
                },
            }
            for chunk in chunks
        ],
    }
