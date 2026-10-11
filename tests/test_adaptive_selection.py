"""Adaptive assessment selector tests."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from services.assessment.select import (
    diagnostic_questions,
    mock_exam_questions,
    score,
    why_selected,
)


def question(concept: str, difficulty: float = 0.5, ident: str = "q") -> SimpleNamespace:
    return SimpleNamespace(
        id=ident, concept_id=concept, difficulty=difficulty, question_type="mcq", embedding=None
    )


def test_selector_scores_weak_concepts_high() -> None:
    state = {"mastery": {"weak": {"p_eff": 0.2}, "strong": {"p_eff": 0.9}}}
    assert score(question("weak"), state) > score(question("strong"), state)


def test_selector_difficulty_fit() -> None:
    state = {"mastery": {"c": {"p_eff": 0.3}}}
    assert score(question("c", 0.5), state) > score(question("c", 0.9), state)


def test_selector_novelty() -> None:
    q = question("c")
    q.embedding = [1.0, 0.0]
    state = {"mastery": {"c": {"p_eff": 0.3}}, "served_embeddings": [[1.0, 0.0]]}
    assert score(q, state) < score(q, {"mastery": {"c": {"p_eff": 0.3}}})


def test_why_selected_tag() -> None:
    state = {"mastery": {"c": {"p_eff": 0.31}}, "prerequisite_names": {"c": ["Statistics"]}}
    assert "Weak (31%)" in why_selected(question("c"), state)
    assert "difficulty matched" in why_selected(question("c"), state)
    assert "prereq of Statistics" in why_selected(question("c"), state)


def test_diagnostic_quiz() -> None:
    candidates = [question("a", ident="a"), question("b", ident="b"), question("a", ident="a2")]
    state = {"mastery": {"a": {"p_eff": 0.5}, "b": {"p_eff": 0.1}}}
    selected = diagnostic_questions(candidates, state, limit=2)
    assert [item.id for item in selected] == ["a", "b"]


def test_mock_exam_mix() -> None:
    candidates = [
        question("c", difficulty, str(index))
        for index, difficulty in enumerate([0.2] * 5 + [0.5] * 8 + [0.8] * 4)
    ]
    selected = mock_exam_questions(candidates, total=10)
    assert sum(item.difficulty < 0.4 for item in selected) == 3
    assert sum(0.4 <= item.difficulty < 0.65 for item in selected) == 5
    assert sum(item.difficulty >= 0.65 for item in selected) == 2
