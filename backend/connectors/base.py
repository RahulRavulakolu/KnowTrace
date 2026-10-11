"""Base connector interface and shared data types for multi-platform course discovery.

All platform-specific connectors inherit from CourseSourceConnector and implement
the abstract methods for searching, fetching details, and retrieving resources.
"""

from __future__ import annotations

import enum
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


class SourcePlatform(str, enum.Enum):
    """Supported educational source platforms."""

    NPTEL = "nptel"
    SWAYAM = "swayam"
    MIT_OCW = "mit_ocw"
    MITX = "mitx"
    KHAN_ACADEMY = "khan_academy"
    EDX = "edx"
    COURSERA = "coursera"

    @property
    def display_name(self) -> str:
        """Human-readable platform name for UI display."""
        names = {
            "nptel": "NPTEL",
            "swayam": "SWAYAM",
            "mit_ocw": "MIT OpenCourseWare",
            "mitx": "MITx",
            "khan_academy": "Khan Academy",
            "edx": "edX",
            "coursera": "Coursera",
        }
        return names.get(self.value, self.value.upper())


class AccessType(str, enum.Enum):
    """Course access classification."""

    FREE = "free"
    FREE_PAID_CERT = "free_paid_cert"
    AUDIT_LIMITED = "audit_limited"
    PAID = "paid"
    UNKNOWN = "unknown"

    @property
    def display_label(self) -> str:
        labels = {
            "free": "Free",
            "free_paid_cert": "Free Learning · Paid Certificate",
            "audit_limited": "Audit / Limited Free",
            "paid": "Paid",
            "unknown": "Access Unknown",
        }
        return labels.get(self.value, self.value)

    @property
    def is_free_learning(self) -> bool:
        return self in (AccessType.FREE, AccessType.FREE_PAID_CERT, AccessType.AUDIT_LIMITED)


class ResourceType(str, enum.Enum):
    """Types of course resources."""

    VIDEO = "video"
    LECTURE_NOTE = "lecture_note"
    PDF = "pdf"
    ASSIGNMENT = "assignment"
    QUIZ = "quiz"
    EXAM = "exam"
    SOLUTION = "solution"
    READING = "reading"
    TRANSCRIPT = "transcript"
    SUBTITLE = "subtitle"
    SYLLABUS = "syllabus"
    DISCUSSION = "discussion"
    OTHER = "other"


@dataclass
class CourseResourceData:
    """A single course resource (video, PDF, assignment, etc.)."""

    title: str
    resource_type: ResourceType
    url: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    file_size: Optional[str] = None
    order: int = 0
    downloadable: bool = False
    meta: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CourseModuleData:
    """A module/week/unit within a course."""

    title: str
    order: int
    description: Optional[str] = None
    resources: List[CourseResourceData] = field(default_factory=list)
    meta: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CatalogCourseData:
    """Normalized course metadata from any platform.

    This is the unified shape returned by all connectors, regardless of origin.
    It contains only discovery-level metadata — no downloaded content.
    """

    source_platform: SourcePlatform
    source_id: str
    title: str
    description: str = ""
    instructor: str = ""
    institution: str = ""
    category: str = ""
    language: str = "en"
    duration: str = ""
    source_url: str = ""
    access_type: AccessType = AccessType.UNKNOWN
    certificate_available: bool = False
    thumbnail_url: str = ""
    tags: List[str] = field(default_factory=list)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    enrollment_count: Optional[int] = None
    rating: Optional[float] = None

    # Resource summary counts (filled during detail fetch)
    video_count: int = 0
    lecture_note_count: int = 0
    assignment_count: int = 0
    quiz_count: int = 0
    exam_count: int = 0

    # Modules (filled during detail fetch)
    modules: List[CourseModuleData] = field(default_factory=list)

    meta: Dict[str, Any] = field(default_factory=dict)

    @property
    def resource_summary_parts(self) -> List[str]:
        """Human-readable resource summary strings for the UI."""
        parts: List[str] = []
        if self.video_count > 0:
            parts.append(f"{self.video_count} Lectures")
        if self.lecture_note_count > 0:
            parts.append("Lecture Notes")
        if self.assignment_count > 0:
            parts.append("Assignments")
        if self.quiz_count > 0:
            parts.append("Quizzes")
        if self.exam_count > 0:
            parts.append("Exams")
        return parts


class CourseSourceConnector(ABC):
    """Abstract base class for all platform connectors.

    Each connector encapsulates the logic for searching and retrieving course
    information from a single educational platform. Connectors should never
    download actual course content — they only retrieve metadata and resource
    URLs. Content ingestion is handled separately after the user explicitly
    selects a course.
    """

    platform: SourcePlatform

    @abstractmethod
    def search_courses(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> List[CatalogCourseData]:
        """Search for courses matching the query string.

        Returns lightweight catalog entries suitable for display in search results.
        """
        ...

    @abstractmethod
    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        """Retrieve detailed course information by platform-specific ID.

        Should populate modules and resource counts where available.
        """
        ...

    @abstractmethod
    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        """Retrieve the list of resources (videos, PDFs, etc.) for a course."""
        ...

    @abstractmethod
    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        """Retrieve the module/week structure of a course."""
        ...

    def get_access_status(self, source_id: str) -> AccessType:
        """Determine the access classification for a specific course.

        Default implementation returns UNKNOWN. Connectors should override
        this when the platform provides reliable access information.
        """
        return AccessType.UNKNOWN

    def get_platform_name(self) -> str:
        """Return the human-readable platform name."""
        return self.platform.display_name
