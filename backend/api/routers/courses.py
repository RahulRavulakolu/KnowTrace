"""Course API endpoints for KnowTrace."""

import hashlib
import mimetypes
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.api.deps import get_optional_user
from backend.core.config import settings
from backend.core.db import get_db
from backend.core.logging import logger
from backend.models.db import (
    ChunkConcept,
    Concept,
    ContentChunk,
    Course,
    Prerequisite,
    Source,
    Topic,
    User,
)
from backend.schemas.course import CourseCreate, CourseCreateResponse, CourseResponse
from services.graph.dag import cyclic_dag
from services.ingestion.classifier import detect_file_type
from services.ingestion.tagging import (
    build_course_taxonomy,
    build_prerequisites,
    tag_chunks_constrained,
)

router = APIRouter(prefix="/courses", tags=["Courses"])

DEFAULT_USER_EMAIL = "student@knowtrace.ai"


def _source_path(course_id: str, source_id: str, filename: str) -> Path:
    """Return a confined raw upload path."""
    safe_name = Path(filename).name
    path = Path("data/raw") / course_id / f"{source_id}_{safe_name}"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _get_or_create_default_user(db: Session, owner_id: Optional[str] = None) -> User:
    """Ensure a valid user exists for course ownership."""
    if owner_id:
        user = db.query(User).filter(User.id == owner_id).first()
        if user:
            return user

    # Default fallback user
    user = db.query(User).filter(User.email == DEFAULT_USER_EMAIL).first()
    if not user:
        user = User(
            email=DEFAULT_USER_EMAIL,
            name="Default Learner",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Created default user id=%s for courses", user.id)
    return user


@router.post(
    "",
    response_model=CourseCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course",
)
def create_course(
    payload: CourseCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> CourseCreateResponse:
    """Create a new course with owner attribution."""
    user = current_user or _get_or_create_default_user(db, payload.owner_id)

    # Check for existing course with same owner and title
    existing = (
        db.query(Course)
        .filter(
            Course.owner_id == user.id,
            Course.title == payload.title,
        )
        .first()
    )
    if existing:
        logger.info("Found existing course id=%s for title='%s'", existing.id, payload.title)
        return CourseCreateResponse(course_id=str(existing.id))

    course = Course(
        owner_id=user.id,
        title=payload.title,
        exam_date=payload.exam_date,
        hours_per_day=payload.hours_per_day,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    logger.info("Created course id=%s title='%s'", course.id, course.title)
    return CourseCreateResponse(course_id=str(course.id))


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Get course by ID",
)
def get_course(
    course_id: str,
    db: Session = Depends(get_db),
) -> CourseResponse:
    """Retrieve course details by UUID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{course_id}' not found",
        )
    return CourseResponse.model_validate(course)


@router.get(
    "",
    response_model=List[CourseResponse],
    summary="List all courses",
)
def list_courses(
    limit: int = 50,
    offset: int = 0,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> List[CourseResponse]:
    """List registered courses."""
    query = db.query(Course)
    if current_user:
        query = query.filter(Course.owner_id == current_user.id)
    courses = query.offset(offset).limit(limit).all()
    return [CourseResponse.model_validate(c) for c in courses]


@router.get(
    "/{course_id}/lectures", summary="Get recorded video lectures and transcripts for course"
)
def course_lectures(course_id: str, db: Session = Depends(get_db)) -> dict:
    """Return all recorded video lectures, modules, transcripts, and notes for this course."""
    from backend.services.lectures import get_course_lectures

    return get_course_lectures(course_id, db)


@router.get("/{course_id}/graph")
def course_graph(course_id: str, db: Session = Depends(get_db)) -> dict:
    """Return topic, concept, prerequisite, and confusable graph data."""
    if db.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    topics = db.query(Topic).filter(Topic.course_id == course_id).all()
    concepts = db.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
    concept_ids = {str(concept.id) for concept in concepts}
    nodes = [{"id": str(topic.id), "name": topic.name, "type": "topic"} for topic in topics] + [
        {"id": str(concept.id), "name": concept.name, "type": "concept"} for concept in concepts
    ]
    edges: list[dict] = [
        {
            "source": str(topic.parent_id),
            "target": str(topic.id),
            "kind": "contains",
            "confidence": 1.0,
        }
        for topic in topics
        if topic.parent_id
    ]
    relationships = db.query(Prerequisite).filter(Prerequisite.concept_id.in_(concept_ids)).all()
    graph = cyclic_dag(course_id, db)
    dag_edges = {(str(source), str(target)) for source, target in graph.edges}
    edges.extend(
        {
            "source": str(edge.prerequisite_id),
            "target": str(edge.concept_id),
            "kind": edge.kind,
            "confidence": edge.confidence,
        }
        for edge in relationships
        if edge.kind != "requires" or (str(edge.prerequisite_id), str(edge.concept_id)) in dag_edges
    )
    return {"nodes": nodes, "edges": edges}


@router.post("/{course_id}/retag")
def retag_course(course_id: str, db: Session = Depends(get_db)) -> dict:
    """Re-run taxonomy tagging and prerequisite analysis without deleting mastery."""
    if db.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if not db.query(Concept).join(Topic).filter(Topic.course_id == course_id).first():
        taxonomy = build_course_taxonomy(course_id, db)
    else:
        taxonomy = {"topic_ids": [], "concept_ids": []}
    db.query(ContentChunk).filter(ContentChunk.course_id == course_id).update(
        {ContentChunk.topic_id: None}, synchronize_session=False
    )
    db.query(ChunkConcept).filter(
        ChunkConcept.chunk_id.in_(
            db.query(ContentChunk.id).filter(ContentChunk.course_id == course_id)
        )
    ).delete(synchronize_session=False)
    db.query(Prerequisite).filter(
        Prerequisite.concept_id.in_(
            db.query(Concept.id).join(Topic).filter(Topic.course_id == course_id)
        )
    ).delete(synchronize_session=False)
    tagging = tag_chunks_constrained(course_id, db)
    prerequisites = build_prerequisites(course_id, db)
    return {"taxonomy": taxonomy, "tagging": tagging, "prerequisites": prerequisites}


@router.post("/{course_id}/sources", status_code=status.HTTP_202_ACCEPTED)
async def upload_sources(
    course_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> dict:
    """Save and enqueue one or more course source files."""
    if db.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    source_ids: list[str] = []
    for upload in files:
        content = await upload.read()
        try:
            file_type = detect_file_type(content, upload.filename)
        except ValueError as exc:
            raise HTTPException(status_code=415, detail=str(exc)) from exc
        digest = hashlib.sha256(content).hexdigest()
        existing = (
            db.query(Source)
            .filter(Source.course_id == course_id, Source.file_hash == digest)
            .first()
        )
        if existing:
            source_ids.append(str(existing.id))
            continue
        source = Source(
            course_id=course_id,
            type=file_type,
            filename=Path(upload.filename or "upload").name,
            file_hash=digest,
            status="queued",
            stage="queued",
            progress=0.0,
        )
        db.add(source)
        db.flush()
        path = _source_path(course_id, str(source.id), source.filename)
        path.write_bytes(content)
        source.uri = str(path)
        source_ids.append(str(source.id))
        db.commit()
        try:
            from redis import Redis
            from rq import Queue

            from backend.worker import ingest

            Queue("ingestion", connection=Redis.from_url(settings.REDIS_URL)).enqueue(
                ingest, str(source.id)
            )
        except Exception as exc:
            logger.warning("Could not enqueue source %s: %s", source.id, exc)
    return {"source_ids": source_ids, "status": "queued"}


@router.get("/{course_id}/processing-status")
def processing_status(course_id: str, db: Session = Depends(get_db)) -> dict:
    """Return live processing state and chunk counts for course sources."""
    if db.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    sources = db.query(Source).filter(Source.course_id == course_id).all()
    return {
        "sources": [
            {
                "id": str(source.id),
                "stage": source.stage,
                "progress": source.progress,
                "chunks_created": db.query(func.count(ContentChunk.id))
                .filter(ContentChunk.source_id == source.id)
                .scalar()
                or 0,
            }
            for source in sources
        ]
    }


@router.get("/sources/{source_id}/file")
def download_source(source_id: str, request: Request, db: Session = Depends(get_db)) -> Response:
    """Stream a source file with single-range HTTP support."""
    source = db.get(Source, source_id)
    if source is None or not source.uri or not Path(source.uri).exists():
        raise HTTPException(status_code=404, detail="Source file not found")
    media_type = mimetypes.guess_type(source.filename)[0] or "application/octet-stream"
    path = Path(source.uri)
    size = path.stat().st_size
    range_header = request.headers.get("range")
    start, end = 0, size - 1
    if range_header and range_header.startswith("bytes="):
        start_text, _, end_text = range_header[6:].partition("-")
        start = int(start_text or 0)
        end = min(int(end_text) if end_text else size - 1, size - 1)
        if start > end or start >= size:
            raise HTTPException(status_code=416, detail="Invalid byte range")
    with path.open("rb") as file_handle:
        file_handle.seek(start)
        content = file_handle.read(end - start + 1)
    headers = {
        "Content-Disposition": f'attachment; filename="{source.filename}"',
        "Accept-Ranges": "bytes",
        "Content-Length": str(len(content)),
    }
    if range_header:
        headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        return Response(content, status_code=206, media_type=media_type, headers=headers)
    return Response(content, media_type=media_type, headers=headers)
