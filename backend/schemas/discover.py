"""Pydantic schemas for the course discovery API."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class PlatformInfo(BaseModel):
    """A single supported platform."""
    id: str
    name: str


class CatalogCourseResponse(BaseModel):
    """Unified catalog course for search results."""
    source_platform: str
    source_platform_name: str
    source_id: str
    title: str
    description: str = ""
    instructor: str = ""
    institution: str = ""
    category: str = ""
    language: str = "en"
    duration: str = ""
    source_url: str = ""
    access_type: str = "unknown"
    access_type_label: str = "Access Unknown"
    is_free_learning: bool = False
    certificate_available: bool = False
    thumbnail_url: str = ""
    tags: List[str] = Field(default_factory=list)
    start_date: Optional[str] = None
    video_count: int = 0
    lecture_note_count: int = 0
    assignment_count: int = 0
    quiz_count: int = 0
    exam_count: int = 0
    resource_summary: List[str] = Field(default_factory=list)


class CourseResourceResponse(BaseModel):
    """A single resource within a module."""
    title: str
    resource_type: str
    url: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    downloadable: bool = False
    order: int = 0


class CourseModuleResponse(BaseModel):
    """A module/week within a course."""
    title: str
    order: int
    description: Optional[str] = None
    resources: List[CourseResourceResponse] = Field(default_factory=list)


class CatalogCourseDetailResponse(CatalogCourseResponse):
    """Full course detail including modules and resources."""
    modules: List[CourseModuleResponse] = Field(default_factory=list)


class UnifiedSearchResponse(BaseModel):
    """Response shape for unified cross-platform search."""
    total: int
    courses: List[CatalogCourseResponse]
    platforms_searched: List[str]


class DiscoverSearchParams(BaseModel):
    """Query parameters for discovery search."""
    query: str = Field(..., min_length=1, max_length=500)
    platforms: Optional[List[str]] = None
    access_types: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    limit: int = Field(50, ge=1, le=200)


class IngestCourseRequest(BaseModel):
    """Payload to trigger ingestion of a catalog course into KnowTrace."""
    platform: str
    source_id: str
    owner_id: Optional[str] = None


class IngestCourseResponse(BaseModel):
    """Result of enrolling/ingesting a catalog course."""
    course_id: str
    title: str
    source_platform: str
    source_id: str
    status: str  # enrolled, existing
    message: str

