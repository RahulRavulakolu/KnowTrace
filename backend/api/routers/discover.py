"""Discovery API router — unified course search across multiple platforms.

Endpoints:
- GET  /discover/search     — Search courses across all or selected platforms
- GET  /discover/sources    — List available source platforms
- GET  /discover/course/{platform}/{source_id} — Get course details
- GET  /discover/categories — List available categories
"""

from __future__ import annotations

from typing import List, Optional, Set

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.api.deps import get_optional_user
from backend.connectors.registry import get_registry
from backend.core.db import get_db
from backend.models.db import Course, Source, User
from backend.schemas.discover import (
    CatalogCourseDetailResponse,
    CatalogCourseResponse,
    IngestCourseRequest,
    IngestCourseResponse,
    PlatformInfo,
    UnifiedSearchResponse,
)

router = APIRouter(prefix="/discover", tags=["Discovery"])


@router.get(
    "/search",
    response_model=UnifiedSearchResponse,
    summary="Search courses across all platforms",
)
def discover_search(
    q: str = Query(..., min_length=1, max_length=500, description="Search query"),
    platforms: Optional[str] = Query(
        None,
        description="Comma-separated platform IDs to filter (e.g. 'nptel,mit_ocw')",
    ),
    access_types: Optional[str] = Query(
        None,
        description="Comma-separated access types (e.g. 'free,free_paid_cert')",
    ),
    categories: Optional[str] = Query(
        None,
        description="Comma-separated categories",
    ),
    limit: int = Query(50, ge=1, le=200, description="Max results"),
) -> UnifiedSearchResponse:
    """Unified course search across all registered educational platforms.

    Returns normalized course metadata from NPTEL, SWAYAM, MIT OCW, MITx,
    Khan Academy, edX, and Coursera in a single response.
    """
    registry = get_registry()

    platform_set: Optional[Set[str]] = None
    if platforms:
        platform_set = {p.strip() for p in platforms.split(",") if p.strip()}

    access_set: Optional[Set[str]] = None
    if access_types:
        access_set = {a.strip() for a in access_types.split(",") if a.strip()}

    category_set: Optional[Set[str]] = None
    if categories:
        category_set = {c.strip() for c in categories.split(",") if c.strip()}

    result = registry.search_all(
        query=q,
        platforms=platform_set,
        access_types=access_set,
        categories=category_set,
        limit=limit,
    )

    courses = [CatalogCourseResponse(**c) for c in result.courses]

    return UnifiedSearchResponse(
        total=result.total,
        courses=courses,
        platforms_searched=result.platforms_searched,
    )


@router.get(
    "/sources",
    response_model=List[PlatformInfo],
    summary="List available source platforms",
)
def list_sources() -> List[PlatformInfo]:
    """List all registered educational platforms that can be searched."""
    registry = get_registry()
    return [PlatformInfo(**p) for p in registry.list_platforms()]


@router.get(
    "/course/{platform}/{source_id}",
    response_model=CatalogCourseDetailResponse,
    summary="Get detailed course information",
)
def get_catalog_course(platform: str, source_id: str) -> CatalogCourseDetailResponse:
    """Retrieve detailed course information from a specific platform.

    Includes module/week structure and resource listings where available.
    """
    registry = get_registry()
    detail = registry.get_course_detail(platform, source_id)

    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Course '{source_id}' not found on platform '{platform}'",
        )

    return CatalogCourseDetailResponse(**detail)


@router.get(
    "/categories",
    summary="List available categories across all platforms",
)
def list_categories() -> dict:
    """Return all unique categories found across the course catalog."""
    registry = get_registry()
    # Search with a broad query to gather all courses
    result = registry.search_all(query="", limit=500)
    categories: set[str] = set()
    for course in result.courses:
        cat = course.get("category", "")
        if cat:
            categories.add(cat)

    return {
        "categories": sorted(categories),
        "total": len(categories),
    }


@router.post(
    "/ingest",
    response_model=IngestCourseResponse,
    summary="Ingest a catalog course into KnowTrace for active learning",
)
def ingest_catalog_course(
    request: IngestCourseRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> IngestCourseResponse:
    """Enroll and ingest a course from an external platform into KnowTrace.

    Creates a Course record, links it to the user, and seeds the initial
    resources from the catalog course metadata for immediate learning.
    """
    registry = get_registry()
    detail = registry.get_course_detail(request.platform, request.source_id)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Course '{request.source_id}' not found on platform '{request.platform}'",
        )

    # Resolve user
    user = current_user
    if not user and request.owner_id:
        user = db.query(User).filter(User.id == request.owner_id).first()
    if not user:
        default_email = "student@knowtrace.ai"
        user = db.query(User).filter(User.email == default_email).first()
        if not user:
            user = User(email=default_email, name="Default Learner")
            db.add(user)
            db.flush()

    # Check if already enrolled
    existing = (
        db.query(Course)
        .filter(
            Course.owner_id == user.id,
            Course.source_platform == request.platform,
            Course.source_id == request.source_id,
        )
        .first()
    )
    if existing:
        return IngestCourseResponse(
            course_id=existing.id,
            title=existing.title,
            source_platform=request.platform,
            source_id=request.source_id,
            status="existing",
            message="Course is already enrolled in your learning workspace.",
        )

    # Disambiguate title if user already has a course with the same title
    course_title = detail["title"]
    title_collision = (
        db.query(Course)
        .filter(
            Course.owner_id == user.id,
            Course.title == course_title,
        )
        .first()
    )
    if title_collision:
        inst_label = (detail.get("institution") or request.platform.upper()).strip()
        candidate = f"{course_title} ({inst_label})"
        if (
            not db.query(Course)
            .filter(Course.owner_id == user.id, Course.title == candidate)
            .first()
        ):
            course_title = candidate
        else:
            suffix = 2
            while (
                db.query(Course)
                .filter(Course.owner_id == user.id, Course.title == f"{candidate} #{suffix}")
                .first()
            ):
                suffix += 1
            course_title = f"{candidate} #{suffix}"

    # Create new course in KnowTrace
    new_course = Course(
        owner_id=user.id,
        title=course_title,
        source_platform=request.platform,
        source_id=request.source_id,
        source_url=detail.get("source_url", ""),
        access_type=detail.get("access_type", "free"),
        instructor=detail.get("instructor", ""),
        institution=detail.get("institution", ""),
        category=detail.get("category", ""),
        language=detail.get("language", "English"),
        duration=detail.get("duration", ""),
        thumbnail_url=detail.get("thumbnail_url", ""),
        certificate_available=detail.get("certificate_available", False),
        is_ingested=True,
        description=detail.get("description", ""),
    )
    db.add(new_course)
    db.flush()

    # Add Source, Topic, Concept, Chunk, and StudyPlan records from module structure
    from datetime import date, timedelta

    from backend.models.db import ChunkConcept, Concept, ContentChunk, StudyPlan, Topic

    module_topic_ids: list[str] = []
    first_chunk_id: str | None = None
    first_concept_id: str | None = None

    for mod_idx, mod in enumerate(detail.get("modules", [])):
        mod_title = mod.get("title", f"Module {mod_idx + 1}")
        topic = Topic(course_id=new_course.id, name=mod_title)
        db.add(topic)
        db.flush()
        module_topic_ids.append(topic.id)

        concept = Concept(
            topic_id=topic.id,
            name=f"{mod_title} Core Concepts",
            description=mod.get("description") or f"Foundational understanding of {mod_title}",
            importance=1.0,
        )
        db.add(concept)
        db.flush()
        if not first_concept_id:
            first_concept_id = concept.id

        for res_idx, res in enumerate(mod.get("resources", [])):
            res_title = res.get("title", f"Resource {res_idx + 1}")
            res_type = res.get("resource_type", "pdf")
            source_type = "video" if res_type == "video" else "pdf"
            source = Source(
                course_id=new_course.id,
                filename=res_title,
                type=source_type,
                uri=res.get("url")
                or f"https://knowtrace.ai/resources/{request.source_id}/{res_title}",
                status="done",
                stage="embed",
                progress=1.0,
            )
            db.add(source)
            db.flush()

            # Create provenance chunk for RAG & AI Tutor grounding
            chunk_text = (
                f"Course: {new_course.title}\n"
                f"Module: {mod_title}\n"
                f"Resource: {res_title}\n\n"
                f"{res.get('description') or mod.get('description') or new_course.description or 'Core learning concepts and practical applications.'}"
            )
            chunk = ContentChunk(
                course_id=new_course.id,
                source_id=source.id,
                modality="video" if source_type == "video" else "text",
                text=chunk_text,
                page=1 if source_type == "pdf" else None,
                ts_start=120.0 if source_type == "video" else None,
                ts_end=360.0 if source_type == "video" else None,
                topic_id=topic.id,
                difficulty=0.3,
                extraction_confidence=0.95,
                language="en",
            )
            db.add(chunk)
            db.flush()
            if not first_chunk_id:
                first_chunk_id = chunk.id

            db.add(ChunkConcept(chunk_id=chunk.id, concept_id=concept.id, relevance=1.0))

    # Initial Study Plan
    study_plan = StudyPlan(
        user_id=user.id,
        course_id=new_course.id,
        title=f"{new_course.title} Study Plan",
        target_date=date.today() + timedelta(days=60),
        topics_priority=module_topic_ids,
        status="active",
        progress=0.1,
    )
    db.add(study_plan)

    db.commit()
    db.refresh(new_course)

    return IngestCourseResponse(
        course_id=new_course.id,
        title=new_course.title,
        source_platform=request.platform,
        source_id=request.source_id,
        status="enrolled",
        message=f"Course successfully enrolled from {detail.get('source_platform_name', request.platform)} into KnowTrace.",
    )
