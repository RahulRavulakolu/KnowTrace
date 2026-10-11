"""Learner model unit and integration coverage."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from backend.models.db import Concept, Course, LearnerMastery, Question, Topic, User
from services.learner_model.bkt import p_eff, update
from services.learner_model.service import (
    post_onboarding,
    record_attempt,
    record_conversation_evidence,
    select_diagnostic_questions,
)


def test_bkt_update_correct() -> None:
    assert update(0.3, "mcq", 0.5, True)["p"] > 0.3


def test_bkt_update_incorrect() -> None:
    assert update(0.7, "mcq", 0.5, False)["p"] < 0.7


def test_bkt_hint_weight() -> None:
    normal = update(0.3, "mcq", 0.5, True)
    hinted = update(0.3, "mcq", 0.5, True, hint=True)
    assert hinted["p"] < normal["p"]


def test_bkt_confidence_weight() -> None:
    ordinary = update(0.7, "mcq", 0.5, False, confidence=0.2)
    confident = update(0.7, "mcq", 0.5, False, confidence=0.9)
    assert confident["p"] < ordinary["p"]


def test_bkt_bounds() -> None:
    assert 0.02 <= update(0.02, "mcq", 1.0, False)["p"] <= 0.98
    assert 0.02 <= update(0.98, "mcq", 0.0, True)["p"] <= 0.98


def test_forgetting_decay() -> None:
    seen = datetime(2026, 1, 1, tzinfo=timezone.utc)
    now = seen + timedelta(days=3)
    assert abs(p_eff(0.9, 3, seen, prior=0.3, now=now) - 0.3 - 0.6 / 2.718281828) < 0.01


def test_cold_start_priors(db_session) -> None:
    user = User(email="learner-prior@example.com")
    course = Course(owner=user, title="Prior course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Concept")
    db_session.add_all([user, course, topic, concept])
    db_session.commit()
    result = post_onboarding(db_session, user.id, course.id, None, 10, {topic.id: 5})
    assert result["concepts_initialized"] == 1
    mastery = (
        db_session.query(LearnerMastery).filter_by(user_id=user.id, concept_id=concept.id).one()
    )
    assert abs(mastery.p_know - 0.6) < 1e-6
    assert mastery.n_obs == 0


def test_diagnostic_selection(db_session) -> None:
    user = User(email="diagnostic@example.com")
    course = Course(owner=user, title="Diagnostic course")
    topics = [Topic(course=course, name=f"T{i}") for i in range(3)]
    concepts = [Concept(topic=topic, name=f"C{i}") for i, topic in enumerate(topics)]
    questions = [
        Question(
            concept=concept,
            question_text=f"Q{i}",
            question_type="mcq",
            correct_answer="a",
            explanation="x",
            difficulty=0.5,
        )
        for i, concept in enumerate(concepts)
    ]
    db_session.add_all([user, course, *topics, *concepts, *questions])
    db_session.commit()
    assert len(select_diagnostic_questions(db_session, course.id)) == 3


def test_record_attempt_persists_mastery(db_session) -> None:
    user = User(email="attempt@example.com")
    course = Course(owner=user, title="Attempt course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Concept")
    question = Question(
        concept=concept,
        question_text="Q",
        question_type="mcq",
        correct_answer="a",
        explanation="x",
        difficulty=0.5,
    )
    db_session.add_all([user, course, topic, concept, question])
    db_session.commit()
    result = record_attempt(db_session, user.id, question.id, "a", True)
    assert result["p"] > 0.3
    assert db_session.query(Question).filter_by(id=question.id).one().attempts


def test_conversation_evidence(monkeypatch, db_session) -> None:
    user = User(email="conversation@example.com")
    course = Course(owner=user, title="Conversation course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Concept")
    db_session.add_all([user, course, topic, concept])
    db_session.commit()

    class Response:
        data = [
            {"concept_id": concept.id, "signal": "confusion", "evidence": "asks for clarification"}
        ]

    monkeypatch.setattr(
        "services.learner_model.service.call_llm", lambda *args, **kwargs: Response()
    )
    evidence = record_conversation_evidence(
        db_session, user.id, "I do not understand", [concept.id]
    )
    assert evidence[0]["signal"] == "confusion"
    mastery = (
        db_session.query(LearnerMastery).filter_by(user_id=user.id, concept_id=concept.id).one()
    )
    assert mastery.p_know < 0.3
