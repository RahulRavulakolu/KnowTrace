"""Connector registry — single entry point for multi-platform discovery.

The registry auto-registers all built-in connectors and provides a unified
search that fans out across all enabled platforms.
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Set

from backend.connectors.base import (
    AccessType,
    CatalogCourseData,
    CourseModuleData,
    CourseResourceData,
    CourseSourceConnector,
    SourcePlatform,
)

logger = logging.getLogger(__name__)


@dataclass
class UnifiedSearchResult:
    """Result container for unified cross-platform search."""
    total: int
    courses: List[Dict[str, Any]]
    platforms_searched: List[str]


class ConnectorRegistry:
    """Central registry of all platform connectors.

    Usage::

        registry = ConnectorRegistry()
        results = registry.search_all("Machine Learning")
    """

    def __init__(self) -> None:
        self._connectors: Dict[SourcePlatform, CourseSourceConnector] = {}
        self._register_builtins()

    def _register_builtins(self) -> None:
        """Register all built-in connectors."""
        from backend.connectors.nptel import NPTELConnector
        from backend.connectors.swayam import SWAYAMConnector
        from backend.connectors.mit_ocw import MITOCWConnector
        from backend.connectors.mitx import MITxConnector
        from backend.connectors.khan_academy import KhanAcademyConnector
        from backend.connectors.edx import EdXConnector
        from backend.connectors.coursera import CourseraConnector

        for cls in [NPTELConnector, SWAYAMConnector, MITOCWConnector,
                     MITxConnector, KhanAcademyConnector, EdXConnector, CourseraConnector]:
            connector = cls()
            self._connectors[connector.platform] = connector

    def register(self, connector: CourseSourceConnector) -> None:
        """Register a custom connector (for future extensibility)."""
        self._connectors[connector.platform] = connector

    def get_connector(self, platform: SourcePlatform) -> Optional[CourseSourceConnector]:
        """Get a specific platform connector."""
        return self._connectors.get(platform)

    def list_platforms(self) -> List[Dict[str, str]]:
        """List all registered platforms with their display names."""
        return [
            {"id": p.value, "name": p.display_name}
            for p in self._connectors
        ]

    def search_all(
        self,
        query: str,
        platforms: Optional[Set[str]] = None,
        access_types: Optional[Set[str]] = None,
        categories: Optional[Set[str]] = None,
        limit: int = 50,
    ) -> UnifiedSearchResult:
        """Search across all (or selected) platforms and return unified results.

        Args:
            query: Search text.
            platforms: Optional set of platform IDs to restrict search to.
            access_types: Optional set of access type values to filter by.
            categories: Optional set of category names to filter by.
            limit: Maximum total results to return.

        Returns:
            UnifiedSearchResult with normalized course data.
        """
        all_results: List[CatalogCourseData] = []
        platforms_searched: List[str] = []

        for platform, connector in self._connectors.items():
            if platforms and platform.value not in platforms:
                continue

            platforms_searched.append(platform.display_name)

            try:
                results = connector.search_courses(query, limit=limit)
                all_results.extend(results)
            except Exception:
                logger.warning("Search failed for platform %s", platform.value, exc_info=True)

        # Apply access type filter
        if access_types:
            all_results = [
                c for c in all_results
                if c.access_type.value in access_types
            ]

        # Apply category filter
        if categories:
            categories_lower = {cat.lower() for cat in categories}
            all_results = [
                c for c in all_results
                if c.category.lower() in categories_lower
                or any(tag.lower() in categories_lower for tag in c.tags)
            ]

        # Deduplicate by (platform, source_id)
        seen: Set[str] = set()
        deduplicated: List[CatalogCourseData] = []
        for course in all_results:
            key = f"{course.source_platform.value}:{course.source_id}"
            if key not in seen:
                seen.add(key)
                deduplicated.append(course)

        # Limit and serialize
        limited = deduplicated[:limit]
        courses_dicts = [_catalog_to_dict(c) for c in limited]

        return UnifiedSearchResult(
            total=len(deduplicated),
            courses=courses_dicts,
            platforms_searched=platforms_searched,
        )

    def get_course_detail(
        self, platform: str, source_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get detailed course info from a specific platform."""
        try:
            plat = SourcePlatform(platform)
        except ValueError:
            return None

        connector = self._connectors.get(plat)
        if not connector:
            return None

        course = connector.get_course(source_id)
        if not course:
            return None

        return _catalog_to_dict(course, include_modules=True)


def _catalog_to_dict(
    course: CatalogCourseData,
    include_modules: bool = False,
) -> Dict[str, Any]:
    """Convert a CatalogCourseData to a JSON-serializable dict."""
    result: Dict[str, Any] = {
        "source_platform": course.source_platform.value,
        "source_platform_name": course.source_platform.display_name,
        "source_id": course.source_id,
        "title": course.title,
        "description": course.description,
        "instructor": course.instructor,
        "institution": course.institution,
        "category": course.category,
        "language": course.language,
        "duration": course.duration,
        "source_url": course.source_url,
        "access_type": course.access_type.value,
        "access_type_label": course.access_type.display_label,
        "is_free_learning": course.access_type.is_free_learning,
        "certificate_available": course.certificate_available,
        "thumbnail_url": course.thumbnail_url,
        "tags": course.tags,
        "start_date": course.start_date,
        "video_count": course.video_count,
        "lecture_note_count": course.lecture_note_count,
        "assignment_count": course.assignment_count,
        "quiz_count": course.quiz_count,
        "exam_count": course.exam_count,
        "resource_summary": course.resource_summary_parts,
    }

    if include_modules and course.modules:
        result["modules"] = [
            {
                "title": m.title,
                "order": m.order,
                "description": m.description,
                "resources": [
                    {
                        "title": r.title,
                        "resource_type": r.resource_type.value,
                        "url": r.url,
                        "description": r.description,
                        "duration_minutes": r.duration_minutes,
                        "downloadable": r.downloadable,
                        "order": r.order,
                    }
                    for r in m.resources
                ],
            }
            for m in course.modules
        ]

    return result


# Module-level singleton for convenience
_registry: Optional[ConnectorRegistry] = None


def get_registry() -> ConnectorRegistry:
    """Get or create the global connector registry singleton."""
    global _registry
    if _registry is None:
        _registry = ConnectorRegistry()
    return _registry
