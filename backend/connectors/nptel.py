"""NPTEL course connector.

NPTEL (National Programme on Technology Enhanced Learning) provides a large
repository of engineering and science courses from Indian IITs and IISc.
All learning content is freely accessible.
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


# Pre-seeded NPTEL course catalog for demo / offline use
_NPTEL_CATALOG: List[CatalogCourseData] = [
    CatalogCourseData(
        source_platform=SourcePlatform.NPTEL,
        source_id="nptel-ml-106106139",
        title="Machine Learning",
        description=(
            "This course covers the theory and practical algorithms of machine learning "
            "including supervised learning, unsupervised learning, learning theory, "
            "reinforcement learning, and adaptive control. It provides a broad introduction "
            "to machine learning and statistical pattern recognition."
        ),
        instructor="Prof. Balaraman Ravindran",
        institution="IIT Madras",
        category="Computer Science & Engineering",
        language="en",
        duration="12 weeks",
        source_url="https://nptel.ac.in/courses/106106139",
        access_type=AccessType.FREE,
        certificate_available=True,
        thumbnail_url="",
        tags=["machine learning", "AI", "pattern recognition", "supervised learning", "deep learning"],
        video_count=40,
        lecture_note_count=40,
        assignment_count=12,
        quiz_count=12,
        modules=[
            CourseModuleData(
                title="Week 1: Introduction to Machine Learning",
                order=1,
                description="Overview of ML paradigms, types of learning, hypothesis spaces",
                resources=[
                    CourseResourceData(title="Lecture 1: Introduction to ML", resource_type=ResourceType.VIDEO, duration_minutes=55, order=1),
                    CourseResourceData(title="Lecture 2: Types of Learning", resource_type=ResourceType.VIDEO, duration_minutes=48, order=2),
                    CourseResourceData(title="Lecture 3: Hypothesis Spaces", resource_type=ResourceType.VIDEO, duration_minutes=52, order=3),
                    CourseResourceData(title="Week 1 Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=4),
                    CourseResourceData(title="Assignment 1", resource_type=ResourceType.ASSIGNMENT, order=5),
                ],
            ),
            CourseModuleData(
                title="Week 2: Linear Regression & Optimization",
                order=2,
                description="Linear models, gradient descent, closed-form solutions",
                resources=[
                    CourseResourceData(title="Lecture 4: Linear Regression", resource_type=ResourceType.VIDEO, duration_minutes=50, order=1),
                    CourseResourceData(title="Lecture 5: Gradient Descent", resource_type=ResourceType.VIDEO, duration_minutes=55, order=2),
                    CourseResourceData(title="Lecture 6: Normal Equations", resource_type=ResourceType.VIDEO, duration_minutes=45, order=3),
                    CourseResourceData(title="Week 2 Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=4),
                    CourseResourceData(title="Assignment 2", resource_type=ResourceType.ASSIGNMENT, order=5),
                ],
            ),
            CourseModuleData(
                title="Week 3: Classification",
                order=3,
                description="Logistic regression, perceptron, decision boundaries",
                resources=[
                    CourseResourceData(title="Lecture 7: Logistic Regression", resource_type=ResourceType.VIDEO, duration_minutes=52, order=1),
                    CourseResourceData(title="Lecture 8: Perceptron Algorithm", resource_type=ResourceType.VIDEO, duration_minutes=48, order=2),
                    CourseResourceData(title="Week 3 Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=3),
                    CourseResourceData(title="Assignment 3", resource_type=ResourceType.ASSIGNMENT, order=4),
                ],
            ),
            CourseModuleData(
                title="Week 4: Regularization & Model Selection",
                order=4,
                description="L1/L2 regularization, bias-variance tradeoff, cross-validation",
                resources=[
                    CourseResourceData(title="Lecture 9: Regularization", resource_type=ResourceType.VIDEO, duration_minutes=55, order=1),
                    CourseResourceData(title="Lecture 10: Bias-Variance Tradeoff", resource_type=ResourceType.VIDEO, duration_minutes=50, order=2),
                    CourseResourceData(title="Lecture 11: Model Selection", resource_type=ResourceType.VIDEO, duration_minutes=48, order=3),
                    CourseResourceData(title="Week 4 Notes", resource_type=ResourceType.LECTURE_NOTE, downloadable=True, order=4),
                    CourseResourceData(title="Assignment 4", resource_type=ResourceType.ASSIGNMENT, order=5),
                ],
            ),
        ],
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.NPTEL,
        source_id="nptel-dl-106106184",
        title="Deep Learning",
        description=(
            "A comprehensive course on deep learning covering neural networks, "
            "backpropagation, CNNs, RNNs, transformers, and generative models."
        ),
        instructor="Prof. Mitesh M. Khapra",
        institution="IIT Madras",
        category="Computer Science & Engineering",
        language="en",
        duration="12 weeks",
        source_url="https://nptel.ac.in/courses/106106184",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["deep learning", "neural networks", "CNN", "RNN", "transformers"],
        video_count=60,
        lecture_note_count=60,
        assignment_count=12,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.NPTEL,
        source_id="nptel-dsa-106102064",
        title="Data Structures and Algorithms",
        description=(
            "Covers fundamental data structures (arrays, linked lists, trees, graphs) "
            "and algorithms (sorting, searching, dynamic programming, greedy algorithms)."
        ),
        instructor="Prof. Naveen Garg",
        institution="IIT Delhi",
        category="Computer Science & Engineering",
        language="en",
        duration="12 weeks",
        source_url="https://nptel.ac.in/courses/106102064",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["data structures", "algorithms", "programming", "sorting", "graphs"],
        video_count=40,
        lecture_note_count=40,
        assignment_count=12,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.NPTEL,
        source_id="nptel-prob-111104079",
        title="Probability and Statistics",
        description=(
            "Introduction to probability theory, random variables, distributions, "
            "estimation, and hypothesis testing with applications."
        ),
        instructor="Prof. Somesh Kumar",
        institution="IIT Kharagpur",
        category="Mathematics",
        language="en",
        duration="12 weeks",
        source_url="https://nptel.ac.in/courses/111104079",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["probability", "statistics", "random variables", "hypothesis testing"],
        video_count=40,
        lecture_note_count=40,
        assignment_count=12,
    ),
    CatalogCourseData(
        source_platform=SourcePlatform.NPTEL,
        source_id="nptel-nlp-106101174",
        title="Natural Language Processing",
        description=(
            "Covers text processing, language models, sequence labeling, "
            "parsing, semantics, and modern NLP with transformers."
        ),
        instructor="Prof. Pawan Goyal",
        institution="IIT Kharagpur",
        category="Computer Science & Engineering",
        language="en",
        duration="8 weeks",
        source_url="https://nptel.ac.in/courses/106101174",
        access_type=AccessType.FREE,
        certificate_available=True,
        tags=["NLP", "natural language processing", "text mining", "transformers"],
        video_count=32,
        lecture_note_count=32,
        assignment_count=8,
    ),
]

_NPTEL_BY_ID = {c.source_id: c for c in _NPTEL_CATALOG}


class NPTELConnector(CourseSourceConnector):
    """Connector for NPTEL course catalog."""

    platform = SourcePlatform.NPTEL

    def search_courses(self, query: str, limit: int = 20, offset: int = 0) -> List[CatalogCourseData]:
        query_lower = query.lower()
        results = [
            c for c in _NPTEL_CATALOG
            if query_lower in c.title.lower()
            or query_lower in c.description.lower()
            or query_lower in c.instructor.lower()
            or any(query_lower in tag for tag in c.tags)
        ]
        return results[offset:offset + limit]

    def get_course(self, source_id: str) -> Optional[CatalogCourseData]:
        return _NPTEL_BY_ID.get(source_id)

    def get_course_resources(self, source_id: str) -> List[CourseResourceData]:
        course = _NPTEL_BY_ID.get(source_id)
        if not course:
            return []
        resources: List[CourseResourceData] = []
        for module in course.modules:
            resources.extend(module.resources)
        return resources

    def get_course_modules(self, source_id: str) -> List[CourseModuleData]:
        course = _NPTEL_BY_ID.get(source_id)
        return course.modules if course else []

    def get_access_status(self, source_id: str) -> AccessType:
        course = _NPTEL_BY_ID.get(source_id)
        return course.access_type if course else AccessType.FREE
