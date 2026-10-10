"""edX connector.

edX hosts courses from universities worldwide. Many courses offer free audit
access while verified certificates require payment.
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

_EDX_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.EDX,
        source_id="edx-harvardx-cs50",
        title="CS50's Introduction to Computer Science",
        description=(
            "An introduction to the intellectual enterprises of computer science "
            "and the art of programming from Harvard University. Topics include "
            "abstraction, algorithms, data structures, encapsulation, resource "
            "management, security, software engineering, and web development."
        ),
        instructor="Prof. David J. Malan",
        institution="Harvard University",
        category="Computer Science",
        language="en",
        duration="12 weeks",
        source_url="https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
        access_type=AccessType.FREE_PAID_CERT,
        certificate_available=True,
        tags=["computer science", "programming", "C", "python", "algorithms", "web development"],
        video_count=24,
        lecture_note_count=11,
        assignment_count=10,
        quiz_count=10,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.EDX,
        source_id="edx-ibm-ml",
        title="Machine Learning with Python: A Practical Introduction",
        description=(
            "Learn the basics of machine learning using Python. Covers regression, "
            "classification, clustering, and recommender systems with hands-on labs."
        ),
        instructor="IBM Skills Network",
        institution="IBM",
        category="Data Science",
        language="en",
        duration="5 weeks",
        source_url="https://www.edx.org/course/machine-learning-with-python-a-practical-introduct",
        access_type=AccessType.FREE_PAID_CERT,
        certificate_available=True,
        tags=["machine learning", "python", "regression", "classification", "clustering"],
        video_count=20,
        lecture_note_count=15,
        assignment_count=5,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.EDX,
        source_id="edx-stanfordx-stat",
        title="Statistical Learning",
        description=(
            "Learn the essential tools of statistical learning from Stanford. "
            "Covers supervised and unsupervised methods, including linear regression, "
            "logistic regression, SVM, trees, boosting, and clustering."
        ),
        instructor="Prof. Trevor Hastie, Prof. Rob Tibshirani",
        institution="Stanford University",
        category="Data Science",
        language="en",
        duration="9 weeks",
        source_url="https://www.edx.org/course/statistical-learning",
        access_type=AccessType.FREE_PAID_CERT,
        certificate_available=True,
        tags=["statistics", "machine learning", "regression", "SVM", "clustering"],
        video_count=36,
        lecture_note_count=20,
        assignment_count=9,
        quiz_count=9,
    ),
]

_EDX_BY_ID = {c.source_id: c for c in _EDX_CATALOG}


class EdXConnector(CourseSourceConnector):
    """Connector for edX courses."""

    platform = SourcePlatform.EDX

    def search_courses(self, query: str, limit: int = 20, offset: int = 0) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c for c in _EDX_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or query_lower in c.instructor.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset:offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _EDX_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        return []

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        return []

    def get_access_status(self, source_id: str) -> AccessType:
        course = _EDX_BY_ID.get(source_id)
        return course.access_type if course else AccessType.FREE_PAID_CERT
