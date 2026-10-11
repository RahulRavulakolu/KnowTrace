"""Prerequisite propagation regression tests."""

from backend.models.db import Concept, Course, LearnerMastery, Prerequisite, Question, Topic, User
from services.learner_model.service import record_attempt


def test_prerequisite_propagation(db_session) -> None:
    user = User(email="propagation@example.com")
    course = Course(owner=user, title="Propagation course")
    topic = Topic(course=course, name="Topic")
    prerequisite = Concept(topic=topic, name="Prerequisite")
    dependent = Concept(topic=topic, name="Dependent")
    question = Question(
        concept=dependent,
        question_text="Q",
        question_type="mcq",
        correct_answer="a",
        explanation="x",
        difficulty=0.5,
    )
    db_session.add_all([user, course, topic, prerequisite, dependent, question])
    db_session.commit()
    edge = Prerequisite(concept_id=dependent.id, prerequisite_id=prerequisite.id, kind="requires")
    db_session.add(edge)
    db_session.commit()
    record_attempt(db_session, user.id, question.id, "wrong", False)
    mastery = (
        db_session.query(LearnerMastery)
        .filter_by(user_id=user.id, concept_id=prerequisite.id)
        .one()
    )
    assert mastery.p_know < 0.3
