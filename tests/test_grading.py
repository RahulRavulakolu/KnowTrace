"""Answer grading tests."""

from types import SimpleNamespace

from services.assessment.grade import grade_question


def test_numerical_tolerance() -> None:
    question = {"question_type": "numerical", "correct_answer": "100"}
    assert grade_question(question, "100.5")["correct"]
    assert not grade_question(question, "102")["correct"]


def test_short_answer_grading(monkeypatch) -> None:
    monkeypatch.setattr(
        "services.assessment.grade.call_llm",
        lambda *args, **kwargs: SimpleNamespace(data={
            "correct": True, "score": 0.8, "feedback": "Good explanation", "misconception_id": None
        }),
    )
    result = grade_question({
        "question_type": "short", "question_text": "Explain", "correct_answer": "Answer",
        "marking_rubric": "Mention the key mechanism",
    }, "Student answer")
    assert result["correct"] and result["score"] == 0.8
