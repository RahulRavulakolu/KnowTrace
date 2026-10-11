"""RQ ingestion worker entry point."""

from pathlib import Path

from backend.core.config import settings
from backend.core.db import SessionLocal
from backend.core.logging import logger
from backend.models.db import ContentChunk, Source
from services.ingestion.embed import embed_chunks
from services.ingestion.pdf import extract_text_and_images as extract_pdf
from services.ingestion.pptx import extract_text_and_images as extract_pptx
from services.ingestion.tagging import (
    build_course_taxonomy,
    build_prerequisites,
    tag_chunks_constrained,
)
from services.ingestion.video import ingest_video


def _maybe_tag_course(db, course_id: str) -> None:
    """Build taxonomy once all course sources have completed ingestion."""
    sources = db.query(Source).filter(Source.course_id == course_id).all()
    if not sources or any(source.status != "done" for source in sources):
        return
    if db.query(ContentChunk).filter(ContentChunk.course_id == course_id).count() == 0:
        return
    from backend.models.db import Concept, Topic

    if not db.query(Concept).join(Topic).filter(Topic.course_id == course_id).first():
        build_course_taxonomy(course_id, db)
    tag_chunks_constrained(course_id, db)
    build_prerequisites(course_id, db)


def ingest(source_id: str) -> None:
    """Process one source and persist chunks without aborting the queue worker."""
    db = SessionLocal()
    source = db.get(Source, source_id)
    if source is None:
        logger.error("Ingestion source %s does not exist", source_id)
        db.close()
        return
    try:
        source.status, source.stage, source.progress = "processing", "parse", 0.0
        db.commit()
        path = Path(source.uri or "")
        if source.type == "video":
            ingest_video(path, str(source.course_id), str(source.id))
            _maybe_tag_course(db, str(source.course_id))
            return
        extractor = extract_pdf if source.type == "pdf" else extract_pptx
        if source.type not in {"pdf", "pptx"}:
            raise ValueError(f"Ingestion is not implemented for source type {source.type}")
        chunks = list(extractor(path, source.course_id, source.id))
        source.stage, source.progress = "embed", 0.75
        db.commit()
        for chunk in embed_chunks(chunks):
            db.add(ContentChunk(**chunk))
        source.status, source.stage, source.progress = "done", "done", 1.0
        db.commit()
        _maybe_tag_course(db, str(source.course_id))
    except Exception as exc:
        db.rollback()
        source.status, source.stage, source.error_message = "failed", "failed", str(exc)
        db.commit()
        logger.exception("Source ingestion failed for %s", source_id)
    finally:
        db.close()
