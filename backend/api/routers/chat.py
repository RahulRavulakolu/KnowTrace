"""Source-grounded chat endpoints."""

import time
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.db import SessionLocal, get_db
from backend.core.llm import call_llm
from backend.models.db import ChatTurn, ChunkConcept, ContentChunk, Course, User
from services.learner_model.service import record_conversation_evidence
from services.retrieval.prompts import P11_OUTSIDE_KNOWLEDGE
from services.retrieval.tutor import tutor_pipeline

router = APIRouter(tags=["Chat"])


def _user(db: Session) -> User:
    """Return the development learner used by the existing course API."""
    user = db.query(User).filter(User.email == "student@knowtrace.ai").first()
    if user is None:
        user = User(email="student@knowtrace.ai", name="Default Learner")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.post("/chat")
def chat(payload: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> dict:
    """Answer a course question and persist both sides of the chat turn."""
    course_id = str(payload.get("course_id", ""))
    message = str(payload.get("message", "")).strip()
    if not message or db.get(Course, course_id) is None:
        raise HTTPException(status_code=400, detail="course_id and message are required")
    started = time.perf_counter()
    result = tutor_pipeline(
        message,
        course_id,
        payload.get("history", []),
        str(payload.get("student_context", "")),
        bool(payload.get("allow_outside", False)),
        db,
    )
    user = _user(db)
    session_id = str(payload.get("session_id") or uuid.uuid4())
    source_ids = [item["chunk_id"] for item in result["sources"]]
    db.add_all(
        [
            ChatTurn(
                user_id=user.id,
                course_id=course_id,
                session_id=session_id,
                role="user",
                content=message,
                anchored_chunk_ids=[],
            ),
            ChatTurn(
                user_id=user.id,
                course_id=course_id,
                session_id=session_id,
                role="assistant",
                content=result["answer"],
                anchored_chunk_ids=source_ids,
                outside_knowledge=result["outside_knowledge_offered"],
                refusal=result["mode"] == "not_covered",
                meta=result["confidence"],
            ),
        ]
    )
    db.commit()
    cited_concepts = [
        str(concept_id)
        for (concept_id,) in db.query(ChunkConcept.concept_id)
        .filter(ChunkConcept.chunk_id.in_(source_ids))
        .all()
    ]
    background_tasks.add_task(
        _record_chat_evidence,
        user.id,
        message,
        result["answer"],
        cited_concepts,
    )
    result["latency_ms"] = (time.perf_counter() - started) * 1000
    return result


def _record_chat_evidence(
    user_id: str, message: str, answer: str, cited_concepts: list[str]
) -> None:
    """Run P13 outside the request transaction."""
    if not cited_concepts:
        return
    with SessionLocal() as db:
        record_conversation_evidence(db, user_id, message, cited_concepts, answer)


@router.post("/chat/outside")
def outside_chat(payload: dict) -> dict:
    """Return explicitly labeled general knowledge without course citations."""
    query = str(payload.get("query", "")).strip()
    if not query:
        raise HTTPException(status_code=400, detail="query is required")
    response = call_llm("A", f"{P11_OUTSIDE_KNOWLEDGE}\nQuestion: {query}")
    return {
        "text": f"This is general knowledge, not from your course.\n{response.content.strip()}",
        "no_citations": True,
    }


@router.get("/chunks/{chunk_id}")
def debug_chunk(chunk_id: str, db: Session = Depends(get_db)) -> dict:
    """Return a complete chunk for development inspection."""
    chunk = db.get(ContentChunk, chunk_id)
    if chunk is None:
        raise HTTPException(status_code=404, detail="Chunk not found")
    return {
        "id": str(chunk.id),
        "course_id": str(chunk.course_id),
        "source_id": str(chunk.source_id),
        "modality": chunk.modality,
        "text": chunk.text,
        "visual": chunk.visual,
        "page": chunk.page,
        "slide": chunk.slide,
        "ts_start": chunk.ts_start,
        "ts_end": chunk.ts_end,
        "bbox": chunk.bbox,
        "topic_id": chunk.topic_id,
        "extraction_confidence": chunk.extraction_confidence,
    }
