"""Phase 1 Foundation Layer Tests for KnowTrace.

Tests:
1. Health check endpoint (GET /health) + Request-ID middleware header
2. Course creation (POST /courses) and retrieval (GET /courses/{id})
3. LLM disk cache: 1st call executes, 2nd call hits disk cache
4. JSON schema handling and 1-attempt repair logic
5. Database schema completeness (all 15 tables and provenance spine columns)
"""

import uuid
from datetime import date
from typing import List, Optional

import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.db import Base
from backend.core.llm import (
    LLMResponse,
    LLMValidationError,
    _extract_json_from_text,
    _parse_and_validate,
    _repair_json_string,
    call_llm,
)
from backend.models.db import (
    Assessment,
    Attempt,
    ChatTurn,
    ChunkConcept,
    Concept,
    ContentChunk,
    Course,
    LearnerMastery,
    Misconception,
    Prerequisite,
    Question,
    Source,
    StudyPlan,
    Topic,
    User,
)
from backend.schemas.course import CourseCreate


# ─── Schemas for structured LLM tests ────────────────────────
class EvaluationResult(BaseModel):
    status: str = Field(..., description="Approval status")
    confidence: float = Field(..., description="Confidence score")
    notes: Optional[str] = Field(None, description="Notes")


# ─── 1. Health & Middleware Tests ────────────────────────────
def test_health_check_endpoint(client: TestClient):
    """GET /health must return status ok, version 1.0.0, and X-Request-ID header."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    # Verify Request-ID middleware header is set
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 0


def test_request_id_propagation(client: TestClient):
    """Custom incoming X-Request-ID should be preserved in the response."""
    custom_id = f"test-req-{uuid.uuid4()}"
    response = client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == custom_id


# ─── 2. Courses API Tests ────────────────────────────────────
def test_create_and_get_course(client: TestClient):
    """POST /courses creates course, GET /courses/{id} retrieves it."""
    # 1. Create course
    payload = {
        "title": "Introduction to Machine Learning",
        "exam_date": "2026-12-15",
        "hours_per_day": 2.5,
    }
    create_res = client.post("/courses", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert "course_id" in created_data
    course_id = created_data["course_id"]
    assert len(course_id) == 36  # UUID length

    # 2. Get course by ID
    get_res = client.get(f"/courses/{course_id}")
    assert get_res.status_code == 200
    course_data = get_res.json()
    assert course_data["id"] == course_id
    assert course_data["title"] == "Introduction to Machine Learning"
    assert course_data["hours_per_day"] == 2.5
    assert course_data["exam_date"] == "2026-12-15"
    assert "owner_id" in course_data


def test_get_nonexistent_course_returns_404(client: TestClient):
    """GET /courses/{id} with missing UUID should return 404."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/courses/{random_id}")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


# ─── 3. LLM Gateway & Cache Tests ────────────────────────────
def test_llm_vendor_switching():
    """Verify Vendor A (Gemini) and Vendor B (Groq/Claude) routing."""
    res_a = call_llm(vendor="A", prompt="Explain gradient descent.", use_cache=False)
    assert isinstance(res_a, LLMResponse)
    assert res_a.vendor == "gemini"

    res_b = call_llm(vendor="B", prompt="Check this question for ambiguity.", use_cache=False)
    assert isinstance(res_b, LLMResponse)
    assert res_b.vendor in ("groq", "claude")


def test_llm_disk_cache_hit():
    """Verify diskcache persists call result: 1st call computes, 2nd call hits cache."""
    unique_prompt = f"Test cache prompt {uuid.uuid4()}"

    # First call: cache miss
    res1 = call_llm(vendor="A", prompt=unique_prompt, use_cache=True)
    assert res1.metadata.get("cached") is False
    assert len(res1.content) > 0

    # Second identical call: must be cache hit
    res2 = call_llm(vendor="A", prompt=unique_prompt, use_cache=True)
    assert res2.metadata.get("cached") is True
    assert res2.content == res1.content


# ─── 4. JSON Schema Handling & Repair Tests ──────────────────
def test_json_extraction_from_markdown_fences():
    """Extract valid JSON nested inside markdown code blocks."""
    raw = 'Some preface text\n```json\n{"status": "approved", "confidence": 0.98}\n```\nDone.'
    extracted = _extract_json_from_text(raw)
    assert extracted.startswith("{")
    assert extracted.endswith("}")


def test_json_repair_trailing_commas():
    """Verify single repair attempt handles trailing commas and unescaped quotes."""
    malformed = '{\n  "status": "approved",\n  "confidence": 0.95,\n}'
    parsed = _parse_and_validate(malformed, json_schema=EvaluationResult, allow_repair=True)
    assert isinstance(parsed, EvaluationResult)
    assert parsed.status == "approved"
    assert parsed.confidence == 0.95


def test_json_validation_failure_raises_error():
    """Unrecoverable malformed input raises LLMValidationError."""
    totally_broken = "This is not JSON at all and cannot be parsed."
    with pytest.raises(LLMValidationError):
        _parse_and_validate(totally_broken, json_schema=EvaluationResult, allow_repair=True)


# ─── 5. Database Schema Completeness Tests ────────────────────
def test_database_schema_all_15_tables_present():
    """Verify all 15 required tables are registered in the SQLAlchemy metadata."""
    expected_tables = {
        "users",
        "courses",
        "sources",
        "topics",
        "concepts",
        "content_chunks",
        "chunk_concepts",
        "prerequisites",
        "questions",
        "assessments",
        "attempts",
        "learner_mastery",
        "misconceptions",
        "chat_turns",
        "study_plans",
    }
    actual_tables = set(Base.metadata.tables.keys())
    missing = expected_tables - actual_tables
    assert not missing, f"Missing tables in database metadata: {missing}"


def test_provenance_spine_columns():
    """Verify Rule 1 provenance spine: content_chunks table stores source_id + page|slide|ts_start/ts_end (+ bbox)."""
    table = Base.metadata.tables["content_chunks"]
    col_names = set(table.columns.keys())

    required_provenance_cols = {
        "id",
        "course_id",
        "source_id",
        "modality",
        "text",
        "visual",
        "page",
        "slide",
        "ts_start",
        "ts_end",
        "bbox",
        "topic_id",
        "difficulty",
        "extraction_confidence",
        "language",
        "embedding",
    }
    missing_cols = required_provenance_cols - col_names
    assert not missing_cols, f"content_chunks missing required provenance columns: {missing_cols}"
