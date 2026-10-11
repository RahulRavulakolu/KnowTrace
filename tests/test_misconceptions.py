from types import SimpleNamespace

from backend.models.db import Concept, Course, Misconception, Topic, User, UserMisconception
from services.learner_model.misconceptions import (
    detect_misconception,
    get_active_misconceptions,
    is_misconception_active,
    update_misconception_severity,
)


def test_detect_misconception_mcq() -> None:
    attempt = SimpleNamespace(
        user_answer="b",
        question=SimpleNamespace(options=[{"key": "b", "misconception_id": "m1"}]),
    )
    assert detect_misconception(attempt, {}) == "m1"


def test_detect_misconception_free_text() -> None:
    attempt = SimpleNamespace(user_answer="precision", question=SimpleNamespace(options=[]))
    assert detect_misconception(attempt, {"misconception_id": "m2"}) == "m2"


def test_severity_thresholds_and_confidence(db_session) -> None:
    user = User(email="misconception@example.com")
    course = Course(owner=user, title="Misconception course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Concept")
    misconception = Misconception(
        concept=concept, course_id=course.id, label="Confusion", description="Mixes concepts"
    )
    db_session.add_all([user, course, topic, concept, misconception])
    db_session.commit()
    update_misconception_severity(db_session, user.id, misconception.id, "wrong_answer", "a1", 0.9)
    row = update_misconception_severity(
        db_session, user.id, misconception.id, "wrong_answer", "a2", 0.9
    )
    assert row.severity == 2.6
    assert row.status == "active"
    assert is_misconception_active(db_session, user.id, misconception.id)
    update_misconception_severity(db_session, user.id, misconception.id, "correct_answer")
    update_misconception_severity(db_session, user.id, misconception.id, "correct_answer")
    update_misconception_severity(db_session, user.id, misconception.id, "correct_answer")
    assert not is_misconception_active(db_session, user.id, misconception.id)


def test_active_dashboard_rows(db_session) -> None:
    user = User(email="misconception-dashboard@example.com")
    course = Course(owner=user, title="Dashboard course")
    topic = Topic(course=course, name="Topic")
    concept = Concept(topic=topic, name="Concept")
    misconception = Misconception(
        concept=concept, course_id=course.id, label="Confusion", description="Mixes concepts"
    )
    db_session.add_all([user, course, topic, concept, misconception])
    db_session.commit()
    update_misconception_severity(
        db_session, user.id, misconception.id, "wrong_answer", "attempt-1", 0.5
    )
    update_misconception_severity(
        db_session, user.id, misconception.id, "wrong_answer", "attempt-2", 0.5
    )
    rows = get_active_misconceptions(db_session, user.id, course.id)
    assert rows[0]["misconception_id"] == misconception.id
    assert rows[0]["evidence"] == ["attempt-1", "attempt-2"]
