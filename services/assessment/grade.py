"""Assessment answer grading."""

from __future__ import annotations

from numbers import Real
from typing import Any

from backend.core.llm import call_llm
from backend.models.db import Question
from services.assessment.prompts import P18_SHORT_ANSWER_GRADER


def grade_question(question: Question | dict[str, Any], response: str) -> dict[str, Any]:
    data = question if isinstance(question, dict) else {
        "question_type": question.question_type, "correct_answer": question.correct_answer,
        "options": question.options or [], "marking_rubric": getattr(question, "marking_rubric", None),
        "question_text": question.question_text,
    }
    qtype = data["question_type"]
    expected = str(data["correct_answer"]).strip()
    if qtype in {"mcq", "multiple_choice"}:
        correct = response.strip().lower() == expected.lower()
        misconception_id = None
        for option in data.get("options", []) or []:
            if isinstance(option, dict) and str(option.get("key", "")).lower() == response.strip().lower():
                misconception_id = option.get("misconception_id")
                break
        return {"correct": correct, "score": 1.0 if correct else 0.0,
                "feedback": "Correct." if correct else "Review the explanation.", "misconception_id": misconception_id}
    if qtype in {"numerical", "numeric"}:
        try:
            actual, target = float(response), float(expected)
            correct = abs(actual - target) <= abs(target) * 0.01 if target else abs(actual) <= 0.01
        except ValueError:
            correct = False
        return {"correct": correct, "score": 1.0 if correct else 0.0,
                "feedback": "Within tolerance." if correct else f"Expected {expected}.", "misconception_id": None}
    result = getattr(call_llm(
        "B", f"{P18_SHORT_ANSWER_GRADER}\nQuestion: {data['question_text']}\n"
        f"Rubric: {data.get('marking_rubric')}\nExpected answer: {expected}\nStudent answer: {response}",
        json_schema={"type": "object"},
    ), "data", {})
    result = result if isinstance(result, dict) else {}
    score = max(0.0, min(1.0, float(result.get("score", 0.0))))
    return {"correct": bool(result.get("correct", score >= 0.7)), "score": score,
            "feedback": str(result.get("feedback", "")),
            "misconception_id": result.get("misconception_id")}
