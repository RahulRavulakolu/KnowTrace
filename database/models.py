"""SQLAlchemy 2.0 Database Models for KnowTrace.

Contains all 15 core entities:
1. users
2. courses
3. sources
4. topics
5. concepts
6. content_chunks (Provenance Spine: source_id + page|slide|ts_start/ts_end + bbox)
7. chunk_concepts
8. prerequisites
9. questions (Status approval pipeline: draft -> approved / rejected)
10. assessments
11. attempts
12. learner_mastery (Bayesian Knowledge Tracing / DKT)
13. misconceptions
14. chat_turns (Provenance-anchored tutoring with outside-knowledge flags & refusals)
15. study_plans
"""

import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    TypeDecorator,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID as PG_UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.types import JSON

from backend.core.config import settings
from backend.core.database import Base

# Universal JSON type compatible with SQLite and PostgreSQL
UniversalJSON = JSON().with_variant(JSONB, "postgresql")


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


class TSVectorType(TypeDecorator):
    """Database-agnostic TSVector column type.
    Uses PostgreSQL TSVECTOR on PostgreSQL and Text on SQLite.
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect: Any) -> Any:
        if dialect.name == "postgresql":
            return dialect.type_descriptor(TSVECTOR)
        return dialect.type_descriptor(Text)


def generate_uuid() -> str:
    """Generate RFC 4122 UUID4 as string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


# ==========================================
# 1. Users
# ==========================================
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="student", nullable=False)  # student, instructor, admin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    attempts: Mapped[List["Attempt"]] = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    mastery_records: Mapped[List["LearnerMastery"]] = relationship("LearnerMastery", back_populates="user", cascade="all, delete-orphan")
    study_plans: Mapped[List["StudyPlan"]] = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    chat_turns: Mapped[List["ChatTurn"]] = relationship("ChatTurn", back_populates="user", cascade="all, delete-orphan")


# ==========================================
# 2. Courses
# ==========================================
class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    sources: Mapped[List["Source"]] = relationship("Source", back_populates="course", cascade="all, delete-orphan")
    topics: Mapped[List["Topic"]] = relationship("Topic", back_populates="course", cascade="all, delete-orphan")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    study_plans: Mapped[List["StudyPlan"]] = relationship("StudyPlan", back_populates="course", cascade="all, delete-orphan")


# ==========================================
# 3. Sources
# ==========================================
class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pdf, video, slides
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending, processing, processed, failed
    metadata_json: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="sources")
    chunks: Mapped[List["ContentChunk"]] = relationship("ContentChunk", back_populates="source", cascade="all, delete-orphan")


# ==========================================
# 4. Topics
# ==========================================
class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="topics")
    concepts: Mapped[List["Concept"]] = relationship("Concept", back_populates="topic", cascade="all, delete-orphan")


# ==========================================
# 5. Concepts
# ==========================================
class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)  # 0.0 (easiest) to 1.0 (hardest)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    topic: Mapped["Topic"] = relationship("Topic", back_populates="concepts")
    chunk_associations: Mapped[List["ChunkConcept"]] = relationship("ChunkConcept", back_populates="concept", cascade="all, delete-orphan")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="concept", cascade="all, delete-orphan")
    mastery_records: Mapped[List["LearnerMastery"]] = relationship("LearnerMastery", back_populates="concept", cascade="all, delete-orphan")
    misconceptions: Mapped[List["Misconception"]] = relationship("Misconception", back_populates="concept", cascade="all, delete-orphan")


# ==========================================
# 6. Content Chunks (The Provenance Spine)
# ==========================================
class ContentChunk(Base):
    """Stores every extracted content atom with full provenance anchor.

    Rule 1: Provenance spine: every chunk stores source_id + page|slide|ts_start/ts_end (+ bbox for figures)
    """
    __tablename__ = "content_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_type: Mapped[str] = mapped_column(String(50), nullable=False)  # text, transcript, slide_text, figure, table
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Provenance Spine Attributes
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)  # PDF page (1-based)
    slide_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)  # PPTX slide (1-based)
    ts_start: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)  # Video start seconds
    ts_end: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)    # Video end seconds
    bbox: Mapped[Optional[dict]] = mapped_column(UniversalJSON, nullable=True)           # [x0, y0, x1, y1] for figures/tables
    image_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)       # Path to figure/table image

    # Search & Embeddings
    embedding = mapped_column(VectorType(dim=settings.VECTOR_DIMENSION), nullable=True)
    search_vector = mapped_column(TSVectorType(), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    source: Mapped["Source"] = relationship("Source", back_populates="chunks")
    concept_associations: Mapped[List["ChunkConcept"]] = relationship("ChunkConcept", back_populates="chunk", cascade="all, delete-orphan")


# ==========================================
# 7. Chunk Concepts (Association Table)
# ==========================================
class ChunkConcept(Base):
    __tablename__ = "chunk_concepts"

    chunk_id: Mapped[str] = mapped_column(String(36), ForeignKey("content_chunks.id", ondelete="CASCADE"), primary_key=True)
    concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), primary_key=True)
    relevance_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    # Relationships
    chunk: Mapped["ContentChunk"] = relationship("ContentChunk", back_populates="concept_associations")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="chunk_associations")


# ==========================================
# 8. Prerequisites (Knowledge Graph Edge)
# ==========================================
class Prerequisite(Base):
    __tablename__ = "prerequisites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    prerequisite_concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type: Mapped[str] = mapped_column(String(50), default="strict", nullable=False)  # strict, soft
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Self-referential concept relationships
    concept: Mapped["Concept"] = relationship("Concept", foreign_keys=[concept_id])
    prerequisite_concept: Mapped["Concept"] = relationship("Concept", foreign_keys=[prerequisite_concept_id])


# ==========================================
# 9. Questions (Validated Question Bank)
# ==========================================
class Question(Base):
    """Assessment items.

    Rule 6: Only validated questions (status='approved') served to students.
    """
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    source_chunk_ids: Mapped[list] = mapped_column(UniversalJSON, default=list, nullable=False)  # Anchored chunk IDs
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)  # multiple_choice, short_answer, code
    options: Mapped[Optional[list]] = mapped_column(UniversalJSON, nullable=True)  # List of dicts for MCQs
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False, index=True)  # draft, approved, rejected
    validated_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Vendor B model identifier
    validation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    concept: Mapped["Concept"] = relationship("Concept", back_populates="questions")
    attempts: Mapped[List["Attempt"]] = relationship("Attempt", back_populates="question")


# ==========================================
# 10. Assessments
# ==========================================
class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    assessment_type: Mapped[str] = mapped_column(String(50), default="quiz", nullable=False)  # diagnostic, formative, quiz
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, completed, archived
    config: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="assessments")
    attempts: Mapped[List["Attempt"]] = relationship("Attempt", back_populates="assessment", cascade="all, delete-orphan")


# ==========================================
# 11. Attempts
# ==========================================
class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    assessment_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0.0 to 1.0
    feedback: Mapped[str] = mapped_column(Text, default="", nullable=False)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="attempts")
    user: Mapped["User"] = relationship("User", back_populates="attempts")
    question: Mapped["Question"] = relationship("Question", back_populates="attempts")


# ==========================================
# 12. Learner Mastery (BKT / Knowledge State)
# ==========================================
class LearnerMastery(Base):
    __tablename__ = "learner_mastery"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    p_know: Mapped[float] = mapped_column(Float, default=0.1, nullable=False)  # BKT probability of knowing
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    last_practiced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    history: Mapped[list] = mapped_column(UniversalJSON, default=list, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mastery_records")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="mastery_records")


# ==========================================
# 13. Misconceptions
# ==========================================
class Misconception(Base):
    __tablename__ = "misconceptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    pattern_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    remediation_chunk_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("content_chunks.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, resolved
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    concept: Mapped["Concept"] = relationship("Concept", back_populates="misconceptions")
    remediation_chunk: Mapped[Optional["ContentChunk"]] = relationship("ContentChunk")


# ==========================================
# 14. Chat Turns (Provenance-Anchored Tutoring)
# ==========================================
class ChatTurn(Base):
    """Represents a conversational turn between learner and KnowTrace tutor.

    Rule 5: Unsupported queries -> refuse; outside knowledge -> labeled distinctly
    """
    __tablename__ = "chat_turns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Grounding & Provenance Metadata
    anchored_chunk_ids: Mapped[list] = mapped_column(UniversalJSON, default=list, nullable=False)
    outside_knowledge_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    refusal_triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    metadata_json: Mapped[dict] = mapped_column(UniversalJSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="chat_turns")


# ==========================================
# 15. Study Plans
# ==========================================
class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    topics_priority: Mapped[list] = mapped_column(UniversalJSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, completed, paused
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0.0 to 1.0
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="study_plans")
    course: Mapped["Course"] = relationship("Course", back_populates="study_plans")
