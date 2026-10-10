"""MIT OpenCourseWare connector.

MIT OCW publishes virtually all MIT course content under open Creative Commons
licenses. All content is free to use, reuse, and redistribute.
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

_MIT_OCW_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.MIT_OCW,
        source_id="mit-ocw-6-042j",
        title="Mathematics for Computer Science",
        description=(
            "This course covers elementary discrete mathematics for computer science "
            "and engineering. Topics include formal logic, proofs, induction, sets, "
            "relations, graph theory, counting, probability, and recurrences. "
            "Emphasis is on mathematical definitions and proofs as well as applicable methods."
        ),
        instructor="Prof. Tom Leighton, Prof. Marten van Dijk",
        institution="MIT",
        category="Mathematics",
        language="en",
        duration="Self-paced",
        source_url="https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["discrete math", "proofs", "graph theory", "probability", "computer science"],
        video_count=25,
        lecture_note_count=25,
        assignment_count=14,
        exam_count=3,
        modules=[
            CourseModuleData(
                title="Unit 1: Proofs",
                order=1,
                description="Propositional logic, proof methods, well ordering, induction",
                resources=[
                    CourseResourceData(title="Lecture 1: Introduction and Proofs", resource_type=ResourceType.VIDEO, duration_minutes=80, order=1,
                                       url="https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/lecture-1-introduction-and-proofs/"),
                    CourseResourceData(title="Lecture 2: Induction", resource_type=ResourceType.VIDEO, duration_minutes=75, order=2),
                    CourseResourceData(title="Lecture 3: Strong Induction", resource_type=ResourceType.VIDEO, duration_minutes=78, order=3),
                    CourseResourceData(title="Unit 1 Lecture Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=4),
                    CourseResourceData(title="Problem Set 1", resource_type=ResourceType.ASSIGNMENT, order=5),
                    CourseResourceData(title="Problem Set 1 Solutions", resource_type=ResourceType.SOLUTION, order=6),
                ],
            ),
            CourseModuleData(
                title="Unit 2: Structures",
                order=2,
                description="GCDs, modular arithmetic, RSA, graphs, trees",
                resources=[
                    CourseResourceData(title="Lecture 4: Number Theory I", resource_type=ResourceType.VIDEO, duration_minutes=82, order=1),
                    CourseResourceData(title="Lecture 5: Number Theory II", resource_type=ResourceType.VIDEO, duration_minutes=78, order=2),
                    CourseResourceData(title="Lecture 6: Graph Theory I", resource_type=ResourceType.VIDEO, duration_minutes=80, order=3),
                    CourseResourceData(title="Unit 2 Lecture Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=4),
                    CourseResourceData(title="Problem Set 2", resource_type=ResourceType.ASSIGNMENT, order=5),
                ],
            ),
            CourseModuleData(
                title="Unit 3: Counting",
                order=3,
                description="Sums, products, permutations, combinations, generating functions",
                resources=[
                    CourseResourceData(title="Lecture 10: Counting Rules", resource_type=ResourceType.VIDEO, duration_minutes=76, order=1),
                    CourseResourceData(title="Lecture 11: Generating Functions", resource_type=ResourceType.VIDEO, duration_minutes=80, order=2),
                    CourseResourceData(title="Unit 3 Lecture Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=3),
                    CourseResourceData(title="Problem Set 5", resource_type=ResourceType.ASSIGNMENT, order=4),
                ],
            ),
            CourseModuleData(
                title="Unit 4: Probability",
                order=4,
                description="Conditional probability, independence, random variables, expectation",
                resources=[
                    CourseResourceData(title="Lecture 18: Probability Introduction", resource_type=ResourceType.VIDEO, duration_minutes=82, order=1),
                    CourseResourceData(title="Lecture 19: Conditional Probability", resource_type=ResourceType.VIDEO, duration_minutes=78, order=2),
                    CourseResourceData(title="Lecture 20: Random Variables", resource_type=ResourceType.VIDEO, duration_minutes=80, order=3),
                    CourseResourceData(title="Unit 4 Lecture Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=4),
                    CourseResourceData(title="Problem Set 9", resource_type=ResourceType.ASSIGNMENT, order=5),
                    CourseResourceData(title="Midterm Exam", resource_type=ResourceType.EXAM, order=6),
                    CourseResourceData(title="Midterm Solutions", resource_type=ResourceType.SOLUTION, order=7),
                ],
            ),
        ],
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.MIT_OCW,
        source_id="mit-ocw-6-006",
        title="Introduction to Algorithms",
        description=(
            "This course provides an introduction to mathematical modeling of "
            "computational problems, common algorithms, algorithmic paradigms, "
            "and data structures. Emphasis on teaching techniques for the "
            "design and analysis of efficient algorithms."
        ),
        instructor="Prof. Erik Demaine, Prof. Srini Devadas",
        institution="MIT",
        category="Computer Science",
        language="en",
        duration="Self-paced",
        source_url="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["algorithms", "data structures", "sorting", "graphs", "dynamic programming"],
        video_count=24,
        lecture_note_count=24,
        assignment_count=8,
        exam_count=2,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.MIT_OCW,
        source_id="mit-ocw-6-034",
        title="Artificial Intelligence",
        description=(
            "This course introduces concepts and techniques of AI including "
            "search, constraint satisfaction, machine learning, probabilistic "
            "inference, and neural networks."
        ),
        instructor="Prof. Patrick Winston",
        institution="MIT",
        category="Computer Science",
        language="en",
        duration="Self-paced",
        source_url="https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["artificial intelligence", "search", "machine learning", "neural networks"],
        video_count=23,
        lecture_note_count=23,
        assignment_count=6,
        exam_count=2,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.MIT_OCW,
        source_id="mit-ocw-18-06",
        title="Linear Algebra",
        description=(
            "This course covers matrix theory and linear algebra, emphasizing "
            "topics useful in other disciplines such as physics, economics, "
            "and statistics. Includes systems of equations, vector spaces, "
            "determinants, eigenvalues, and positive definite matrices."
        ),
        instructor="Prof. Gilbert Strang",
        institution="MIT",
        category="Mathematics",
        language="en",
        duration="Self-paced",
        source_url="https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        access_type=AccessType.FREE,
        certificate_available=False,
        tags=["linear algebra", "matrices", "eigenvalues", "vector spaces"],
        video_count=34,
        lecture_note_count=34,
        assignment_count=10,
        exam_count=3,
    ),
]

_OCW_BY_ID = {c.source_id: c for c in _MIT_OCW_CATALOG}


class MITOCWConnector(CourseSourceConnector):
    """Connector for MIT OpenCourseWare."""

    platform = SourcePlatform.MIT_OCW

    def search_courses(self, query: str, limit: int = 20, offset: int = 0) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c for c in _MIT_OCW_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or query_lower in c.instructor.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset:offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _OCW_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        course = _OCW_BY_ID.get(source_id)
        if not course:
            return []
        resources: List[CourseResourceData] = []
        for module in course.modules:
            resources.extend(module.resources)
        return resources

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        course = _OCW_BY_ID.get(source_id)
        return course.modules if course else []

    def get_access_status(self, source_id: str) -> AccessType:
        # All MIT OCW content is free under Creative Commons
        return AccessType.FREE
