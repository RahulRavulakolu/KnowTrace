"""Unit tests for the unified LLM Gateway (call_llm).

Tests compliance with:
- Rule 2: All LLM calls via backend/core/llm.py: call_llm(vendor, prompt, json_schema, images, temperature)
- Rule 3: Vendor "A" = Gemini (generation, vision); Vendor "B" = Claude/Groq (validation)
- Structured schema parsing and validation using Pydantic models.
"""

import pytest
from pydantic import BaseModel, Field

from backend.core.llm import (
    LLMResponse,
    LLMValidationError,
    call_llm,
    _extract_json_from_text,
    _parse_and_validate,
)
from backend.schemas.common import LLMValidationResult


class SampleSchema(BaseModel):
    summary: str = Field(..., description="Summary text")
    score: float = Field(..., description="Numeric score")


def test_call_llm_vendor_a_gemini():
    """Verify Vendor 'A' routes to Gemini with mock fallback during tests."""
    response = call_llm(
        vendor="A",
        prompt="Explain Bayes' theorem simply.",
        temperature=0.1,
    )
    assert isinstance(response, LLMResponse)
    assert response.vendor == "gemini"
    assert response.content is not None
    assert len(response.content) > 0


def test_call_llm_vendor_b_groq():
    """Verify Vendor 'B' routes to Groq/Claude with mock fallback during tests."""
    response = call_llm(
        vendor="B",
        prompt="Audit this physics question for hallucinations.",
        temperature=0.0,
    )
    assert isinstance(response, LLMResponse)
    assert response.vendor in ("groq", "claude")
    assert response.content is not None


def test_call_llm_invalid_vendor():
    """Verify calling an unknown vendor raises ValueError."""
    with pytest.raises(ValueError) as exc_info:
        call_llm(vendor="UnknownVendor", prompt="Hello")
    assert "Unsupported vendor" in str(exc_info.value)


def test_extract_json_from_markdown():
    """Verify extraction of JSON from markdown fenced code blocks."""
    raw_markdown = """
    Here is your requested output:
    ```json
    {
        "status": "approved",
        "validation_score": 0.95
    }
    ```
    Have a nice day!
    """
    extracted = _extract_json_from_text(raw_markdown)
    assert extracted.startswith("{")
    assert extracted.endswith("}")


def test_parse_and_validate_pydantic():
    """Verify structured parsing into a target Pydantic model."""
    valid_json = '{"summary": "Test summary", "score": 0.85}'
    result = _parse_and_validate(valid_json, json_schema=SampleSchema)
    assert isinstance(result, SampleSchema)
    assert result.summary == "Test summary"
    assert result.score == 0.85


def test_parse_and_validate_failure():
    """Verify schema mismatches raise LLMValidationError."""
    invalid_json = '{"unrelated_field": "bad data"}'
    with pytest.raises(LLMValidationError):
        _parse_and_validate(invalid_json, json_schema=SampleSchema)


def test_structured_llm_call_with_validation_result():
    """Verify call_llm with LLMValidationResult schema."""
    response = call_llm(
        vendor="B",
        prompt="Validate this multiple choice question.",
        json_schema=LLMValidationResult,
    )
    assert isinstance(response, LLMResponse)
