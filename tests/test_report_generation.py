"""Post-assessment report tests."""

from types import SimpleNamespace

from backend.models.db import (
    Assessment,
    Attempt,
    Concept,
    Course,
    LearnerMastery,
    Question,
    Topic,
    User,
)
from services.assessment.report import generate_report


def test_report_generation(monkeypatch, db_session) -> None:
    user = User(email="report@example.com")
    course = Course(owner=user, title="Report course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Weak concept")
    question = Question(
        concept=concept,
        question_text="Q",
        question_type="mcq",
        correct_answer="A",
        explanation="E",
        difficulty=0.5,
    )
    assessment = Assessment(course=course, title="Quiz", assessment_type="quiz")
    db_session.add_all([user, course, topic, concept, question, assessment])
    db_session.commit()
    assessment.user_id = user.id
    db_session.add(
        LearnerMastery(user_id=user.id, concept_id=concept.id, p_know=0.2, n_obs=1, half_life=3)
    )
    db_session.add(
        Attempt(
            assessment_id=assessment.id,
            user_id=user.id,
            question_id=question.id,
            user_answer="B",
            is_correct=False,
            score=0.0,
        )
    )
    db_session.commit()
    monkeypatch.setattr(
        "services.assessment.report.call_llm",
        lambda *args, **kwargs: SimpleNamespace(
            data={
                "summary": "Review foundations",
                "misconceptions": [],
                "root_cause": None,
                "actions": [],
            }
        ),
    )
    report = generate_report(assessment.id, db_session)
    assert report["weak_concepts"][0]["concept"] == "Weak concept"
    assert report["root_cause"]["concept_id"] == concept.id
