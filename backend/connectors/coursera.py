"""Coursera connector.

Coursera offers courses from universities and industry partners.
Many courses allow free audit access; certificates and full course access
may require payment depending on the specific course.
"""

from __future__ import annotations

from typing import List, Optional

from backend.connectors.base import (
    AccessType,
    CatalogCourseData,
    CourseModuleData,
    CourseResourceData,
    CourseSourceConnector,
    ResourceType,
    SourcePlatform,
)

_COURSERA_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.COURSERA,
        source_id="coursera-stanford-ml",
        title="Machine Learning",
        description=(
            "Stanford's machine learning course covering linear regression, "
            "logistic regression, neural networks, SVMs, unsupervised learning, "
            "dimensionality reduction, anomaly detection, and recommender systems."
        ),
        instructor="Andrew Ng",
        institution="Stanford University",
        category="Computer Science",
        language="en",
        duration="11 weeks",
        source_url="https://www.coursera.org/learn/machine-learning",
        access_type=AccessType.AUDIT_LIMITED,
        certificate_available=True,
        tags=["machine learning", "neural networks", "SVM", "regression", "deep learning"],
        video_count=110,
        lecture_note_count=50,
        assignment_count=11,
        quiz_count=11,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.COURSERA,
        source_id="coursera-deeplearning-ai",
        title="Deep Learning Specialization",
        description=(
            "Five-course specialization covering neural networks, hyperparameter tuning, "
            "regularization, optimization, CNNs, sequence models, and more."
        ),
        instructor="Andrew Ng",
        institution="deeplearning.ai",
        category="Computer Science",
        language="en",
        duration="4 months",
        source_url="https://www.coursera.org/specializations/deep-learning",
        access_type=AccessType.AUDIT_LIMITED,
        certificate_available=True,
        tags=["deep learning", "neural networks", "CNN", "RNN", "NLP"],
        video_count=180,
        lecture_note_count=80,
        assignment_count=25,
        quiz_count=20,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.COURSERA,
        source_id="coursera-algorithms-princeton",
        title="Algorithms, Part I",
        description=(
            "Covers elementary data structures, sorting, and searching algorithms "
            "from Princeton University."
        ),
        instructor="Prof. Robert Sedgewick, Prof. Kevin Wayne",
        institution="Princeton University",
        category="Computer Science",
        language="en",
        duration="6 weeks",
        source_url="https://www.coursera.org/learn/algorithms-part1",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["algorithms", "data structures", "sorting", "searching"],
        video_count=48,
        lecture_note_count=24,
        assignment_count=6,
    ),
]

_COURSERA_BY_ID = {c.source_id: c for c in _COURSERA_CATALOG}


class CourseraConnector(CourseSourceConnector):
    """Connector for Coursera courses."""

    platform = SourcePlatform.COURSERA

    def search_courses(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c
            for c in _COURSERA_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or query_lower in c.instructor.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset : offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _COURSERA_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        return []

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        return []

    def get_access_status(self, source_id: str) -> AccessType:
        course = _COURSERA_BY_ID.get(source_id)
        return course.access_type if course else AccessType.AUDIT_LIMITED
