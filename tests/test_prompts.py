"""Unit tests ensuring all prompt templates adhere to Rule 4."""

import pytest
from services.ingestion.prompts import (
    FIGURE_CAPTIONING_SYSTEM_PROMPT,
    TRANSCRIPT_CLEANING_SYSTEM_PROMPT,
    CHUNK_CONCEPT_EXTRACTION_PROMPT,
)
from services.retrieval.prompts import (
    QUERY_EXPANSION_PROMPT,
    TUTOR_SYSTEM_PROMPT,
    TUTOR_USER_PROMPT,
)
from services.assessment.prompts import (
    QUESTION_GENERATION_PROMPT,
    QUESTION_VALIDATION_PROMPT,
)
from services.learner_model.prompts import (
    MISCONCEPTION_DIAGNOSIS_PROMPT,
    REMEDIATION_PLAN_PROMPT,
)
from services.graph.prompts import (
    CONCEPT_HIERARCHY_EXTRACTION_PROMPT,
    PREREQUISITE_IDENTIFICATION_PROMPT,
)


def test_ingestion_prompts():
    """Verify ingestion prompts are non-empty and support formatting."""
    assert len(FIGURE_CAPTIONING_SYSTEM_PROMPT) > 50
    formatted = TRANSCRIPT_CLEANING_SYSTEM_PROMPT.format(ts_start=10.0, ts_end=25.0)
    assert "10.0" in formatted and "25.0" in formatted

    formatted_chunk = CHUNK_CONCEPT_EXTRACTION_PROMPT.format(chunk_content="Neural Networks")
    assert "Neural Networks" in formatted_chunk


def test_retrieval_prompts_and_rule_5_refusal():
    """Verify retrieval prompts enforce Rule 5 refusal and outside knowledge constraints."""
    assert "Not found in your course material" in TUTOR_SYSTEM_PROMPT
    assert "[OUTSIDE KNOWLEDGE]" in TUTOR_SYSTEM_PROMPT


def test_assessment_prompts_and_rule_6():
    """Verify assessment prompts enforce Rule 6 approved status check and anchoring."""
    assert "status = \"approved\"" in QUESTION_VALIDATION_PROMPT
    assert "source_id" in QUESTION_GENERATION_PROMPT


def test_learner_model_prompts():
    """Verify learner model prompts exist and format properly."""
    assert "{student_answer}" in MISCONCEPTION_DIAGNOSIS_PROMPT
    formatted_remediation = REMEDIATION_PLAN_PROMPT.format(
        p_know=0.45,
        concept_name="Limits",
        misconceptions="None",
        prerequisites="Algebra",
    )
    assert "0.45" in formatted_remediation
    assert "Limits" in formatted_remediation


def test_graph_prompts():
    """Verify knowledge graph prompts format properly."""
    assert "{outline_text}" in CONCEPT_HIERARCHY_EXTRACTION_PROMPT
    formatted = PREREQUISITE_IDENTIFICATION_PROMPT.format(
        concept_a_name="Matrices",
        concept_a_desc="2D arrays",
        concept_b_name="Determinants",
        concept_b_desc="Matrix scalar",
    )
    assert "Matrices" in formatted
    assert "Determinants" in formatted
