"""Validation pipeline integration checks."""

from types import SimpleNamespace

from services.assessment.validate import validate_question


def test_approved_question_report(monkeypatch) -> None:
    responses = iter(
        [
            SimpleNamespace(data={"ambiguous": False, "multiple_correct": False}),
            SimpleNamespace(data={"concept_id": "c1", "confidence": 0.95}),
        ]
    )
    monkeypatch.setattr(
        "services.assessment.validate.call_llm", lambda *args, **kwargs: next(responses)
    )
    result = validate_question(
        {"type": "short", "stem": "Question", "answer": "yes", "support_span": "Evidence"},
        SimpleNamespace(text="Evidence proves the answer"),
        SimpleNamespace(id="c1", name="Concept"),
        solver=lambda _: {"answer": "yes"},
    )
    assert result["status"] == "approved"
    assert result["validation_report"]["rejection_reason"] is None
