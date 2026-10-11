"""MITx connector.

MITx offers online courses through edX that provide free learning access
while certificates may involve a fee.
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

_MITX_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.MITX,
        source_id="mitx-6-00-1x",
        title="Introduction to Computer Science and Programming Using Python",
        description=(
            "An introduction to computer science as a tool to solve real-world "
            "analytical problems using Python 3. Covers computational thinking, "
            "data structures, algorithms, testing and debugging, and "
            "algorithmic complexity."
        ),
        instructor="Prof. John Guttag, Prof. Eric Grimson, Prof. Ana Bell",
        institution="MIT",
        category="Computer Science",
        language="en",
        duration="9 weeks",
        source_url="https://www.edx.org/course/introduction-to-computer-science-and-programming-7",
        access_type=AccessType.FREE_PAID_CERT,
        certificate_available=True,
        tags=["python", "computer science", "programming", "algorithms", "data structures"],
        start_date="2026-01-15",
        video_count=36,
        lecture_note_count=36,
        assignment_count=9,
        quiz_count=9,
        modules=[
            CourseModuleData(
                title="Unit 1: Python Basics",
                order=1,
                description="Variables, types, operators, branching, iteration",
                resources=[
                    CourseResourceData(
                        title="Lecture 1: What is computation?",
                        resource_type=ResourceType.VIDEO,
                        duration_minutes=50,
                        order=1,
                    ),
                    CourseResourceData(
                        title="Lecture 2: Branching and Iteration",
                        resource_type=ResourceType.VIDEO,
                        duration_minutes=45,
                        order=2,
                    ),
                    CourseResourceData(
                        title="Unit 1 Notes",
                        resource_type=ResourceType.LECTURE_NOTE,
                        downloadable=True,
                        order=3,
                    ),
                    CourseResourceData(
                        title="Problem Set 1", resource_type=ResourceType.ASSIGNMENT, order=4
                    ),
                ],
            ),
            CourseModuleData(
                title="Unit 2: Simple Programs",
                order=2,
                description="Functions, recursion, global variables, modules",
                resources=[
                    CourseResourceData(
                        title="Lecture 3: String Manipulation, Guess and Check",
                        resource_type=ResourceType.VIDEO,
                        duration_minutes=48,
                        order=1,
                    ),
                    CourseResourceData(
                        title="Lecture 4: Decomposition, Abstraction, Functions",
                        resource_type=ResourceType.VIDEO,
                        duration_minutes=52,
                        order=2,
                    ),
                    CourseResourceData(
                        title="Unit 2 Notes",
                        resource_type=ResourceType.LECTURE_NOTE,
                        downloadable=True,
                        order=3,
                    ),
                    CourseResourceData(
                        title="Problem Set 2", resource_type=ResourceType.ASSIGNMENT, order=4
                    ),
                ],
            ),
            CourseModuleData(
                title="Unit 3: Structured Types",
                order=3,
                description="Tuples, lists, aliasing, mutability, cloning",
                resources=[
                    CourseResourceData(
                        title="Lecture 5: Tuples, Lists, Aliasing",
                        resource_type=ResourceType.VIDEO,
                        duration_minutes=50,
                        order=1,
                    ),
                    CourseResourceData(
                        title="Lecture 6: Recursion, Dictionaries",
                        resource_type=ResourceType.VIDEO,
                        duration_minutes=55,
                        order=2,
                    ),
                    CourseResourceData(
                        title="Unit 3 Notes",
                        resource_type=ResourceType.LECTURE_NOTE,
                        downloadable=True,
                        order=3,
                    ),
                    CourseResourceData(
                        title="Problem Set 3", resource_type=ResourceType.ASSIGNMENT, order=4
                    ),
                ],
            ),
        ],
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.MITX,
        source_id="mitx-6-86x",
        title="Machine Learning with Python: from Linear Models to Deep Learning",
        description=(
            "An in-depth introduction to the field of machine learning, from "
            "linear models to deep learning and reinforcement learning, through "
            "hands-on Python projects."
        ),
        instructor="Prof. Regina Barzilay, Prof. Tommi Jaakkola, Prof. Karene Chu",
        institution="MIT",
        category="Computer Science",
        language="en",
        duration="15 weeks",
        source_url="https://www.edx.org/course/machine-learning-with-python-from-linear-models-to",
        access_type=AccessType.FREE_PAID_CERT,
        certificate_available=True,
        tags=["machine learning", "deep learning", "python", "reinforcement learning"],
        video_count=60,
        lecture_note_count=45,
        assignment_count=7,
        quiz_count=6,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.MITX,
        source_id="mitx-6-431x",
        title="Probability - The Science of Uncertainty and Data",
        description=(
            "Build foundational knowledge of data science with this introduction to "
            "probabilistic models, including random variables, estimation, and "
            "inference methods."
        ),
        instructor="Prof. John Tsitsiklis, Prof. Patrick Jaillet",
        institution="MIT",
        category="Data Science",
        language="en",
        duration="16 weeks",
        source_url="https://www.edx.org/course/probability-the-science-of-uncertainty-and-data",
        access_type=AccessType.FREE_PAID_CERT,
        certificate_available=True,
        tags=["probability", "statistics", "data science", "inference"],
        video_count=64,
        lecture_note_count=50,
        assignment_count=12,
        exam_count=4,
    ),
]

_MITX_BY_ID = {c.source_id: c for c in _MITX_CATALOG}


class MITxConnector(CourseSourceConnector):
    """Connector for MITx courses."""

    platform = SourcePlatform.MITX

    def search_courses(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c
            for c in _MITX_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or query_lower in c.instructor.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset : offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _MITX_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        course = _MITX_BY_ID.get(source_id)
        if not course:
            return []
        resources: List[CourseResourceData] = []
        for module in course.modules:
            resources.extend(module.resources)
        return resources

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        course = _MITX_BY_ID.get(source_id)
        return course.modules if course else []

    def get_access_status(self, source_id: str) -> AccessType:
        return AccessType.FREE_PAID_CERT
