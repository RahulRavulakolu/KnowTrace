from datetime import date, timedelta

from backend.models.db import Concept, Course, LearnerMastery, Prerequisite, Topic, User
from services.learner_model.planner import (
    build_plan,
    compute_diff,
    priority,
    retrievability,
    topological_priority_order,
)


def test_priority_calculation() -> None:
    assert priority(0.2, 2.0, 2, 0.7) == 3.5


def test_topological_order() -> None:
    result = topological_priority_order(
        ["dependent", "prereq"], [("dependent", "prereq")], {"dependent": 10, "prereq": 1}
    )
    assert result.index("prereq") < result.index("dependent")


def test_retrievability_decay() -> None:
    value = retrievability(
        "c1",
        {"last_seen": "2026-01-01T00:00:00+00:00", "half_life": 3},
        __import__("datetime").datetime(2026, 1, 4, tzinfo=__import__("datetime").timezone.utc),
    )
    assert 0.35 < value < 0.38


def test_budget_respected_and_weak_first(db_session) -> None:
    user = User(email="planner@example.com")
    course = Course(owner=user, title="Planner", hours_per_day=1)
    topic = Topic(course=course, name="Topic")
    weak = Concept(topic=topic, name="Weak", importance=1)
    strong = Concept(topic=topic, name="Strong", importance=1)
    db_session.add_all([user, course, topic, weak, strong])
    db_session.commit()
    db_session.add(
        LearnerMastery(user_id=user.id, concept_id=weak.id, p_know=0.1, n_obs=3, half_life=3)
    )
    db_session.add(
        LearnerMastery(user_id=user.id, concept_id=strong.id, p_know=0.9, n_obs=3, half_life=3)
    )
    db_session.commit()
    plan = build_plan(db_session, user.id, course.id, date(2026, 1, 6), date(2026, 1, 1))
    total = sum(block["minutes"] for day in plan["days"] for block in day["blocks"])
    assert total <= 3 * 60
    assert plan["days"][0]["blocks"][0]["concept_id"] == weak.id


def test_diff_computation() -> None:
    old = [{"date": "2026-01-01", "blocks": [{"concept_id": "a", "minutes": 10}]}]
    new = [{"date": "2026-01-02", "blocks": [{"concept_id": "b", "minutes": 10}]}]
    diff = compute_diff(old, new)
    assert diff["added"] == ["b"]
    assert diff["removed"] == ["a"]
