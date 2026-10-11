"""Khan Academy connector.

Khan Academy offers free courses and practice exercises across multiple
subjects. All content is completely free.
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

_KHAN_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.KHAN_ACADEMY,
        source_id="khan-linear-algebra",
        title="Linear Algebra",
        description=(
            "Learn the basics of linear algebra — vectors, vector spaces, "
            "subspaces, matrices, transformations, eigenvalues, and eigenvectors."
        ),
        instructor="Sal Khan",
        institution="Khan Academy",
        category="Mathematics",
        language="en",
        duration="Self-paced",
        source_url="https://www.khanacademy.org/math/linear-algebra",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["linear algebra", "vectors", "matrices", "eigenvalues"],
        video_count=75,
        assignment_count=30,
        quiz_count=20,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.KHAN_ACADEMY,
        source_id="khan-statistics-probability",
        title="Statistics and Probability",
        description=(
            "Learn statistics and probability: analyzing data, modeling distributions, "
            "and designing studies."
        ),
        instructor="Sal Khan",
        institution="Khan Academy",
        category="Mathematics",
        language="en",
        duration="Self-paced",
        source_url="https://www.khanacademy.org/math/statistics-probability",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["statistics", "probability", "data analysis", "distributions"],
        video_count=120,
        assignment_count=60,
        quiz_count=40,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.KHAN_ACADEMY,
        source_id="khan-intro-to-ml",
        title="Intro to Machine Learning",
        description=(
            "An introduction to the main concepts behind machine learning, "
            "from supervised to unsupervised learning."
        ),
        instructor="Khan Academy Team",
        institution="Khan Academy",
        category="Computing",
        language="en",
        duration="Self-paced",
        source_url="https://www.khanacademy.org/computing/computer-science/machine-learning",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["machine learning", "AI", "computer science"],
        video_count=20,
        assignment_count=10,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.KHAN_ACADEMY,
        source_id="khan-algorithms",
        title="Algorithms",
        description=(
            "Learn how to design efficient algorithms covering binary search, "
            "sorting, recursion, graph algorithms, and more."
        ),
        instructor="Tom Cormen",
        institution="Khan Academy / Dartmouth",
        category="Computing",
        language="en",
        duration="Self-paced",
        source_url="https://www.khanacademy.org/computing/computer-science/algorithms",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["algorithms", "sorting", "graphs", "recursion", "computer science"],
        video_count=45,
        assignment_count=25,
        quiz_count=15,
    ),
]

_KHAN_BY_ID = {c.source_id: c for c in _KHAN_CATALOG}


class KhanAcademyConnector(CourseSourceConnector):
    """Connector for Khan Academy."""

    platform = SourcePlatform.KHAN_ACADEMY

    def search_courses(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c
            for c in _KHAN_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset : offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _KHAN_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        return []

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        return []

    def get_access_status(self, source_id: str) -> AccessType:
        return AccessType.FREE
