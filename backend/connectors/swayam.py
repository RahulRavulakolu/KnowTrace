"""SWAYAM course connector.

SWAYAM (Study Webs of Active-Learning for Young Aspiring Minds) is India's
national MOOC platform offering courses from universities and national
coordinators across diverse disciplines.
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

_SWAYAM_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.SWAYAM,
        source_id="swayam-intro-ml-2024",
        title="Introduction to Machine Learning",
        description=(
            "A gentle introduction to machine learning concepts covering supervised "
            "and unsupervised techniques, model evaluation, and practical applications "
            "using Python."
        ),
        instructor="Prof. S. Bapi Raju",
        institution="IIIT Hyderabad",
        category="Computer Science",
        language="en",
        duration="8 weeks",
        source_url="https://swayam.gov.in/nd2_cec20_cs15",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["machine learning", "python", "AI", "data science"],
        video_count=32,
        lecture_note_count=32,
        assignment_count=8,
        quiz_count=8,
        modules=[
            CourseModuleData(
                title="Week 1: Foundations of Machine Learning",
                order=1,
                description="What is ML, history, types of learning",
                resources=[
                    CourseResourceData(title="Introduction to ML", resource_type=ResourceType.VIDEO, duration_minutes=40, order=1),
                    CourseResourceData(title="Types of ML", resource_type=ResourceType.VIDEO, duration_minutes=35, order=2),
                    CourseResourceData(title="Week 1 Reading Material", resource_type=ResourceType.READING, downloadable=True, order=3),
                    CourseResourceData(title="Self-Assessment Quiz 1", resource_type=ResourceType.QUIZ, order=4),
                ],
            ),
            CourseModuleData(
                title="Week 2: Data Preprocessing & Feature Engineering",
                order=2,
                resources=[
                    CourseResourceData(title="Data Cleaning Techniques", resource_type=ResourceType.VIDEO, duration_minutes=45, order=1),
                    CourseResourceData(title="Feature Selection", resource_type=ResourceType.VIDEO, duration_minutes=38, order=2),
                    CourseResourceData(title="Week 2 Reading Material", resource_type=ResourceType.READING, downloadable=True, order=3),
                    CourseResourceData(title="Self-Assessment Quiz 2", resource_type=ResourceType.QUIZ, order=4),
                ],
            ),
        ],
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.SWAYAM,
        source_id="swayam-python-prog-2024",
        title="Programming in Python",
        description=(
            "Comprehensive Python programming course covering basics, data structures, "
            "OOP, file handling, and introductory data analysis with NumPy and Pandas."
        ),
        instructor="Prof. Rizwan Rehman",
        institution="Dibrugarh University",
        category="Computer Science",
        language="en",
        duration="12 weeks",
        source_url="https://swayam.gov.in/nd2_cec20_cs16",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["python", "programming", "OOP", "data analysis"],
        video_count=48,
        lecture_note_count=48,
        assignment_count=12,
        quiz_count=12,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.SWAYAM,
        source_id="swayam-data-science-2024",
        title="Introduction to Data Science",
        description=(
            "Learn data science fundamentals including data wrangling, visualization, "
            "statistical inference, and machine learning basics."
        ),
        instructor="Prof. Arnab Bhattacharya",
        institution="IIT Kanpur",
        category="Data Science",
        language="en",
        duration="8 weeks",
        source_url="https://swayam.gov.in/nd2_noc20_cs70",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["data science", "statistics", "visualization", "python"],
        video_count=32,
        lecture_note_count=24,
        assignment_count=8,
        quiz_count=8,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.SWAYAM,
        source_id="swayam-discrete-math-2024",
        title="Discrete Mathematics",
        description=(
            "Covers sets, relations, functions, graph theory, combinatorics, "
            "Boolean algebra, and mathematical logic."
        ),
        instructor="Prof. Aditi Gangopadhyay",
        institution="IIT Roorkee",
        category="Mathematics",
        language="en",
        duration="12 weeks",
        source_url="https://swayam.gov.in/nd2_noc20_ma51",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["discrete mathematics", "graph theory", "logic", "combinatorics"],
        video_count=48,
        lecture_note_count=48,
        assignment_count=12,
    ),
]

_SWAYAM_BY_ID = {c.source_id: c for c in _SWAYAM_CATALOG}


class SWAYAMConnector(CourseSourceConnector):
    """Connector for SWAYAM course catalog."""

    platform = SourcePlatform.SWAYAM

    def search_courses(self, query: str, limit: int = 20, offset: int = 0) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c for c in _SWAYAM_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or query_lower in c.instructor.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset:offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _SWAYAM_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        course = _SWAYAM_BY_ID.get(source_id)
        if not course:
            return []
        resources: List[CourseResourceData] = []
        for module in course.modules:
            resources.extend(module.resources)
        return resources

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        course = _SWAYAM_BY_ID.get(source_id)
        return course.modules if course else []

    def get_access_status(self, source_id: str) -> AccessType:
        return AccessType.FREE
