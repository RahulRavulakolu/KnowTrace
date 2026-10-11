"""SQLAlchemy ORM models for KnowTrace.

Contains all 15 core entities:
1. User (users)
2. Course (courses)
3. Source (sources)
4. Topic (topics)
5. Concept (concepts)
6. ContentChunk (content_chunks - Provenance spine)
7. ChunkConcept (chunk_concepts)
8. Prerequisite (prerequisites)
9. Question (questions)
10. Assessment (assessments)
11. Attempt (attempts)
12. LearnerMastery (learner_mastery)
13. Misconception (misconceptions)
14. ChatTurn (chat_turns)
15. StudyPlan (study_plans)
"""

import uuid
from datetime import date, datetime, timezone
from typing import Any, List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    TypeDecorator,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from backend.core.db import Base

# Universal JSON type compatible with SQLite and PostgreSQL
UniversalJSON = JSON().with_variant(JSONB, "postgresql")


def generate_uuid() -> str:
    """Generate RFC 4122 v4 UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """UTC timestamp factory."""
    return datetime.now(timezone.utc)


class UniversalList(TypeDecorator):
    """Stores lists as JSON on SQLite and JSONB on PostgreSQL for portable testing."""

    impl = UniversalJSON
    cache_ok = True

    def process_bind_param(self, value: Any, dialect: Any) -> Any:
        if value is None:
            return []
        return list(value)

    def process_result_value(self, value: Any, dialect: Any) -> Any:
        if value is None:
            return []
        return list(value)


class VectorType(TypeDecorator):
    """Database-agnostic Vector column type.
    Uses pgvector.sqlalchemy.Vector on PostgreSQL and UniversalJSON on SQLite.
    """

    impl = UniversalJSON
    cache_ok = True

    def __init__(self, dim: int = 1024, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.dim = dim

    def load_dialect_impl(self, dialect: Any) -> Any:
        if dialect.name == "postgresql":
            try:
                from pgvector.sqlalchemy import Vector

                return dialect.type_descriptor(Vector(self.dim))
            except ImportError:
                return dialect.type_descriptor(UniversalJSON)
        return dialect.type_descriptor(UniversalJSON)


# ==========================================
# 1. Users
# ==========================================
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    courses: Mapped[List["Course"]] = relationship(
        "Course", back_populates="owner", cascade="all, delete-orphan"
    )
    attempts: Mapped[List["Attempt"]] = relationship(
        "Attempt", back_populates="user", cascade="all, delete-orphan"
    )
    mastery_records: Mapped[List["LearnerMastery"]] = relationship(
        "LearnerMastery", back_populates="user", cascade="all, delete-orphan"
    )
    misconceptions: Mapped[List["Misconception"]] = relationship(
        "Misconception", back_populates="user", cascade="all, delete-orphan"
    )
    user_misconceptions: Mapped[List["UserMisconception"]] = relationship(
        "UserMisconception", back_populates="user", cascade="all, delete-orphan"
    )
    chat_turns: Mapped[List["ChatTurn"]] = relationship(
        "ChatTurn", back_populates="user", cascade="all, delete-orphan"
    )
    study_plans: Mapped[List["StudyPlan"]] = relationship(
        "StudyPlan", back_populates="user", cascade="all, delete-orphan"
    )


# ==========================================
# 2. Courses
# ==========================================
class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    # Retained for compatibility with the original model tests and imported
    # course fixtures. New API-created courses use owner_id/title instead.
    code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    exam_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    hours_per_day: Mapped[float] = mapped_column(Float, default=2.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Multi-platform discovery & catalog attributes
    source_platform: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    access_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    instructor: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    institution: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    language: Mapped[Optional[str]] = mapped_column(String(50), default="English", nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    certificate_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_ingested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("owner_id", "title", name="uq_owner_course_title"),)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="courses")
    sources: Mapped[List["Source"]] = relationship(
        "Source", back_populates="course", cascade="all, delete-orphan"
    )
    topics: Mapped[List["Topic"]] = relationship(
        "Topic", back_populates="course", cascade="all, delete-orphan"
    )
    chunks: Mapped[List["ContentChunk"]] = relationship(
        "ContentChunk", back_populates="course", cascade="all, delete-orphan"
    )
    assessments: Mapped[List["Assessment"]] = relationship(
        "Assessment", back_populates="course", cascade="all, delete-orphan"
    )
    chat_turns: Mapped[List["ChatTurn"]] = relationship(
        "ChatTurn", back_populates="course", cascade="all, delete-orphan"
    )
    study_plans: Mapped[List["StudyPlan"]] = relationship(
        "StudyPlan", back_populates="course", cascade="all, delete-orphan"
    )

    def __init__(self, **kwargs: Any) -> None:
        """Support legacy ``Course(title=..., code=...)`` fixtures.

        Production callers should provide ``owner_id``. Legacy fixtures omit
        it, so attach a synthetic owner that is persisted through the normal
        relationship cascade and still satisfies the foreign-key constraint.
        """
        kwargs.setdefault("code", None)
        if "owner_id" not in kwargs and "owner" not in kwargs:
            legacy_code = kwargs.get("code") or uuid.uuid4().hex[:8]
            kwargs["owner"] = User(email=f"legacy-{legacy_code}-{uuid.uuid4().hex}@knowtrace.local")
        super().__init__(**kwargs)


# ==========================================
# 3. Sources
# ==========================================
class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # pdf, pptx, video, image
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    uri: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="queued", nullable=False
    )  # queued, processing, done, failed
    stage: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )  # parse, ocr, vision, transcribe, tag, embed
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meta: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="sources")
    chunks: Mapped[List["ContentChunk"]] = relationship(
        "ContentChunk", back_populates="source", cascade="all, delete-orphan"
    )


# ==========================================
# 4. Topics
# ==========================================
class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="topics")
    parent: Mapped[Optional["Topic"]] = relationship(
        "Topic", remote_side=[id], back_populates="subtopics"
    )
    subtopics: Mapped[List["Topic"]] = relationship("Topic", back_populates="parent")
    concepts: Mapped[List["Concept"]] = relationship(
        "Concept", back_populates="topic", cascade="all, delete-orphan"
    )
    chunks: Mapped[List["ContentChunk"]] = relationship("ContentChunk", back_populates="topic")


# ==========================================
# 5. Concepts
# ==========================================
class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    topic_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    importance: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    topic: Mapped["Topic"] = relationship("Topic", back_populates="concepts")
    chunk_associations: Mapped[List["ChunkConcept"]] = relationship(
        "ChunkConcept", back_populates="concept", cascade="all, delete-orphan"
    )
    questions: Mapped[List["Question"]] = relationship(
        "Question", back_populates="concept", cascade="all, delete-orphan"
    )
    mastery_records: Mapped[List["LearnerMastery"]] = relationship(
        "LearnerMastery", back_populates="concept", cascade="all, delete-orphan"
    )
    misconceptions: Mapped[List["Misconception"]] = relationship(
        "Misconception", back_populates="concept", cascade="all, delete-orphan"
    )


# ==========================================
# 6. Content Chunks (Provenance Spine)
# ==========================================
class ContentChunk(Base):
    __tablename__ = "content_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    modality: Mapped[str] = mapped_column(
        String(50), default="text", nullable=False
    )  # text, figure, chart, equation, transcript
    text: Mapped[str] = mapped_column(Text, nullable=False)
    visual: Mapped[Optional[dict]] = mapped_column(
        UniversalJSON, nullable=True
    )  # caption, extracted_labels, etc.
    page: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    slide: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    ts_start: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ts_end: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    bbox: Mapped[Optional[list]] = mapped_column(UniversalList, nullable=True)  # [x0, y0, x1, y1]
    topic_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True
    )
    difficulty: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    extraction_confidence: Mapped[float] = mapped_column(Float, default=0.9, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    embedding: Mapped[Optional[Any]] = mapped_column(VectorType(dim=1024), nullable=True)
    embedding_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="chunks")
    source: Mapped["Source"] = relationship("Source", back_populates="chunks")
    topic: Mapped[Optional["Topic"]] = relationship("Topic", back_populates="chunks")
    concept_associations: Mapped[List["ChunkConcept"]] = relationship(
        "ChunkConcept", back_populates="chunk", cascade="all, delete-orphan"
    )


# ==========================================
# 7. Chunk-Concept Association
# ==========================================
class ChunkConcept(Base):
    __tablename__ = "chunk_concepts"

    chunk_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("content_chunks.id", ondelete="CASCADE"), primary_key=True
    )
    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), primary_key=True
    )
    relevance: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="primary", nullable=False)

    chunk: Mapped["ContentChunk"] = relationship(
        "ContentChunk", back_populates="concept_associations"
    )
    concept: Mapped["Concept"] = relationship("Concept", back_populates="chunk_associations")


# ==========================================
# 8. Prerequisites
# ==========================================
class Prerequisite(Base):
    __tablename__ = "prerequisites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False
    )
    prerequisite_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False
    )
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    kind: Mapped[str] = mapped_column(String(50), default="requires", nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("concept_id", "prerequisite_id", name="uq_prereq_edge"),)


# ==========================================
# 9. Questions
# ==========================================
class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_chunk_ids: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # mcq, short_answer, code, true_false
    options: Mapped[Optional[Any]] = mapped_column(
        UniversalJSON, nullable=True
    )  # [{key, text, is_correct}]
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    bloom_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="draft", nullable=False, index=True
    )  # draft, approved, rejected
    validated_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    validation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    support_span: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_chunk_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("content_chunks.id", ondelete="SET NULL"), nullable=True
    )
    numerical_python: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    marking_rubric: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    validation_report: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    embedding: Mapped[Optional[list]] = mapped_column(UniversalList, default=list, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    concept: Mapped["Concept"] = relationship("Concept", back_populates="questions")
    attempts: Mapped[List["Attempt"]] = relationship(
        "Attempt", back_populates="question", cascade="all, delete-orphan"
    )


# ==========================================
# 10. Assessments
# ==========================================
class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    assessment_type: Mapped[str] = mapped_column(String(50), default="quiz", nullable=False)
    question_ids: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    config: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="assessments")
    attempts: Mapped[List["Attempt"]] = relationship(
        "Attempt", back_populates="assessment", cascade="all, delete-orphan"
    )


# ==========================================
# 11. Attempts
# ==========================================
class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    user_answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    feedback: Mapped[Optional[str]] = mapped_column(Text, default="", nullable=True)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    misconception_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="attempts")
    user: Mapped["User"] = relationship("User", back_populates="attempts")
    question: Mapped["Question"] = relationship("Question", back_populates="attempts")


# ==========================================
# 12. Learner Mastery (BKT)
# ==========================================
class LearnerMastery(Base):
    __tablename__ = "learner_mastery"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False
    )
    p_know: Mapped[float] = mapped_column(Float, default=0.1, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    n_obs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    half_life: Mapped[float] = mapped_column(Float, default=3.0, nullable=False)
    last_practiced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    history: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    __table_args__ = (UniqueConstraint("user_id", "concept_id", name="uq_user_concept_mastery"),)

    user: Mapped["User"] = relationship("User", back_populates="mastery_records")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="mastery_records")


class MasteryHistory(Base):
    """Append-only audit trail for learner-model updates."""

    __tablename__ = "mastery_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    p_before: Mapped[float] = mapped_column(Float, nullable=False)
    p_after: Mapped[float] = mapped_column(Float, nullable=False)
    p_eff: Mapped[float] = mapped_column(Float, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, nullable=False, index=True
    )


# ==========================================
# 13. Misconceptions
# ==========================================
class Misconception(Base):
    __tablename__ = "misconceptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True
    )
    concept_a: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    concept_b: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    wrong_answer_patterns: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    pattern_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    remediation_chunk_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("content_chunks.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="misconceptions")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="misconceptions")


class UserMisconception(Base):
    __tablename__ = "user_misconceptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    misconception_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("misconceptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    severity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="resolved", nullable=False, index=True)
    evidence_attempt_ids: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, nullable=False, index=True
    )
    remediation_pack: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="user_misconceptions")
    misconception: Mapped["Misconception"] = relationship("Misconception")


# ==========================================
# 14. Chat Turns
# ==========================================
class ChatTurn(Base):
    __tablename__ = "chat_turns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    anchored_chunk_ids: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    outside_knowledge: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    refusal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    meta: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="chat_turns")
    course: Mapped["Course"] = relationship("Course", back_populates="chat_turns")


# ==========================================
# 15. Study Plans
# ==========================================
class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    topics_priority: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    plan_data: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="study_plans")
    course: Mapped["Course"] = relationship("Course", back_populates="study_plans")


# ==========================================
# 16. Multi-Platform Catalog (Discovery Layer)
# ==========================================
class CatalogCourse(Base):
    """Catalog course discovered from an external educational platform.

    Represents lightweight metadata discovered before ingestion into a full Course.
    """

    __tablename__ = "catalog_courses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source_id: Mapped[str] = mapped_column(String(200), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instructor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    institution: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    language: Mapped[str] = mapped_column(String(50), default="English", nullable=False)
    duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    access_type: Mapped[str] = mapped_column(String(50), default="free", nullable=False, index=True)
    certificate_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    tags: Mapped[list] = mapped_column(UniversalList, default=list, nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_ingested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    ingested_course_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True
    )
    meta: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("source_platform", "source_id", name="uq_catalog_platform_source_id"),
    )

    # Relationships
    modules: Mapped[List["CourseModule"]] = relationship(
        "CourseModule",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="CourseModule.order",
    )
    ingested_course: Mapped[Optional["Course"]] = relationship("Course")


class CourseModule(Base):
    """A module or weekly unit within a catalog course."""

    __tablename__ = "course_modules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    catalog_course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("catalog_courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meta: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)

    # Relationships
    course: Mapped["CatalogCourse"] = relationship("CatalogCourse", back_populates="modules")
    resources: Mapped[List["CourseResource"]] = relationship(
        "CourseResource",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="CourseResource.order",
    )


class CourseResource(Base):
    """An educational resource (video, notes, assignment, etc.) in a course module."""

    __tablename__ = "course_resources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    module_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    resource_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # video, lecture_note, assignment, quiz, exam, transcript
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    downloadable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    meta: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)

    # Relationships
    module: Mapped["CourseModule"] = relationship("CourseModule", back_populates="resources")
