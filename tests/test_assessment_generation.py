"""Assessment generation and validation tests."""

from types import SimpleNamespace

from services.assessment.validate import (
    blind_solver,
    is_duplicate,
    mcq_structure,
    span_check,
    validate_question,
)


def test_span_check() -> None:
    assert span_check("gradient descent minimizes loss", "Gradient descent minimizes loss.")
    assert not span_check("not in source", "Gradient descent minimizes loss.")


def test_blind_solver() -> None:
    question = {"type": "mcq", "stem": "2+2?", "options": [], "answer": "B"}
    assert blind_solver(question, lambda _: {"answer": "B"})


def test_mcq_structure() -> None:
    options = [
        {"text": "A", "is_correct": True},
        {"text": "B", "is_correct": False, "misconception": "confuses terms"},
        {"text": "C", "is_correct": False, "misconception": "reverses cause"},
        {"text": "D", "is_correct": False, "misconception": "overgeneralizes"},
    ]
    assert mcq_structure(options)


def test_ambiguity_detection(monkeypatch) -> None:
    monkeypatch.setattr(
        "services.assessment.validate.call_llm",
        lambda *args, **kwargs: SimpleNamespace(data={"ambiguous": True, "multiple_correct": False}),
    )
    chunk = SimpleNamespace(text="Evidence span")
    concept = SimpleNamespace(id="c1", name="Concept")
    result = validate_question(
        {"type": "short", "stem": "Question", "answer": "yes", "support_span": "Evidence span"},
        chunk, concept, solver=lambda _: {"answer": "yes"},
    )
    assert result["status"] == "rejected"
    assert result["validation_report"]["rejection_reason"] == "ambiguity"


def test_topic_recheck(monkeypatch) -> None:
    responses = iter([
        SimpleNamespace(data={"ambiguous": False, "multiple_correct": False}),
        SimpleNamespace(data={"concept_id": "other", "confidence": 0.9}),
    ])
    monkeypatch.setattr("services.assessment.validate.call_llm", lambda *args, **kwargs: next(responses))
    result = validate_question(
        {"type": "short", "stem": "Question", "answer": "yes", "support_span": "Evidence span"},
        SimpleNamespace(text="Evidence span"),
        SimpleNamespace(id="c1", name="Concept"),
        solver=lambda _: {"answer": "yes"},
    )
    assert result["validation_report"]["topic_mismatch"]


def test_dedup() -> None:
    assert is_duplicate("What is gradient descent?", [{"stem": "What is gradient descent?"}])
    assert not is_duplicate("A different question", [{"stem": "What is gradient descent?"}])
