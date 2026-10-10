"""Adaptive study-plan construction from mastery and prerequisite evidence."""

from __future__ import annotations

import math
from collections import defaultdict, deque
from datetime import date, datetime, timedelta, timezone
from typing import Any, Iterable

from sqlalchemy.orm import Session

from backend.models.db import Concept, Course, LearnerMastery, Prerequisite, StudyPlan, Topic
from services.learner_model.bkt import p_eff


def retrievability(concept_id: str, mastery: dict[str, Any], now: datetime | None = None) -> float:
    """Return the forgetting-curve retrievability for a mastery payload."""
    now = now or datetime.now(timezone.utc)
    last_seen = mastery.get("last_seen") or mastery.get("last_practiced_at")
    if not last_seen:
        return 0.0
    if isinstance(last_seen, str):
        last_seen = datetime.fromisoformat(last_seen)
    if last_seen.tzinfo is None:
        last_seen = last_seen.replace(tzinfo=timezone.utc)
    days = max(0.0, (now - last_seen).total_seconds() / 86400)
    return math.exp(-days / max(float(mastery.get("half_life", 3.0)), 0.001))


def priority(
    p_eff_value: float,
    importance: float,
    weak_dependents: int = 0,
    retrievability_value: float = 1.0,
) -> float:
    """Apply the documented priority formula."""
    return (
        (1 - p_eff_value) * importance * (1 + 0.5 * weak_dependents)
        + (0.3 if retrievability_value < 0.8 else 0.0)
    )


def topological_priority_order(
    concept_ids: Iterable[str],
    prerequisite_edges: Iterable[tuple[str, str]],
    priorities: dict[str, float],
) -> list[str]:
    """Sort by priority while guaranteeing prerequisites precede dependents."""
    ids = {str(item) for item in concept_ids}
    outgoing: dict[str, list[str]] = defaultdict(list)
    indegree = {item: 0 for item in ids}
    for dependent, prerequisite in prerequisite_edges:
        dependent, prerequisite = str(dependent), str(prerequisite)
        if dependent not in ids or prerequisite not in ids:
            continue
        outgoing[prerequisite].append(dependent)
        indegree[dependent] += 1
    ready = [item for item, degree in indegree.items() if degree == 0]
    result: list[str] = []
    while ready:
        ready.sort(key=lambda item: (-priorities.get(item, 0.0), item))
        current = ready.pop(0)
        result.append(current)
        for dependent in outgoing[current]:
            indegree[dependent] -= 1
            if indegree[dependent] == 0:
                ready.append(dependent)
    # A malformed legacy graph should not make planning fail.
    return result + sorted(ids - set(result), key=lambda item: -priorities.get(item, 0.0))


def _mastery_payload(db: Session, user_id: str, concept: Concept) -> dict[str, Any]:
    record = db.query(LearnerMastery).filter_by(user_id=user_id, concept_id=concept.id).first()
    if record is None:
        return {"p_eff": 0.3, "half_life": 3.0, "last_seen": None, "n_obs": 0}
    return {
        "p_eff": p_eff(record.p_know, record.half_life, record.last_practiced_at),
        "half_life": record.half_life, "last_seen": record.last_practiced_at,
        "n_obs": record.n_obs,
    }


def _source_link(concept: Concept) -> str | None:
    if concept.chunk_associations:
        chunk = concept.chunk_associations[0].chunk
        return f"/view/{chunk.source_id}?chunk_id={chunk.id}"
    return None


def build_plan(
    db: Session,
    user_id: str,
    course_id: str,
    exam_date: date | None = None,
    today: date | None = None,
) -> dict[str, Any]:
    """Build and persist a day-by-day study/practice/revision plan."""
    course = db.get(Course, course_id)
    if course is None:
        raise ValueError("Course not found")
    today = today or date.today()
    exam_date = exam_date or course.exam_date or (today + timedelta(days=14))
    concepts = db.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
    concept_ids = [str(item.id) for item in concepts]
    edges = db.query(Prerequisite).filter(
        Prerequisite.concept_id.in_(concept_ids), Prerequisite.kind == "requires"
    ).all()
    dependents = defaultdict(int)
    for edge in edges:
        dependents[str(edge.prerequisite_id)] += 1
    payloads = {str(concept.id): _mastery_payload(db, user_id, concept) for concept in concepts}
    priorities = {
        str(concept.id): priority(
            payloads[str(concept.id)]["p_eff"], concept.importance,
            dependents[str(concept.id)],
            retrievability(str(concept.id), payloads[str(concept.id)]),
        )
        for concept in concepts
    }
    order = topological_priority_order(
        concept_ids, [(str(edge.concept_id), str(edge.prerequisite_id)) for edge in edges], priorities
    )
    by_id = {str(concept.id): concept for concept in concepts}
    blocks_by_concept: dict[str, list[dict[str, Any]]] = {}
    for concept_id in order:
        minutes = max(1, round(10 + 40 * (1 - payloads[concept_id]["p_eff"])))
        study = round(minutes * 0.5)
        practice = round(minutes * 0.3)
        revise = max(1, minutes - study - practice)
        blocks_by_concept[concept_id] = [
            {"type": "study", "concept_id": concept_id, "minutes": study, "source_link": _source_link(by_id[concept_id])},
            {"type": "practice", "concept_id": concept_id, "minutes": practice, "source_link": None},
            {"type": "revise", "concept_id": concept_id, "minutes": revise, "source_link": _source_link(by_id[concept_id])},
        ]
    days_available = max(0, (exam_date - today).days - 2)
    budget = round(days_available * float(course.hours_per_day) * 60)
    blocks: list[dict[str, Any]] = []
    remaining = budget
    for concept_id in order:
        for block in blocks_by_concept[concept_id]:
            if remaining <= 0:
                break
            minutes = min(block["minutes"], remaining)
            if minutes:
                blocks.append({**block, "minutes": minutes})
                remaining -= minutes
        if remaining <= 0:
            break
    days: list[dict[str, Any]] = []
    per_day = max(1, round(float(course.hours_per_day) * 60))
    for index in range(days_available):
        day_blocks: list[dict[str, Any]] = []
        capacity = per_day
        while blocks and capacity:
            block = blocks[0]
            take = min(block["minutes"], capacity)
            day_blocks.append({**block, "minutes": take})
            capacity -= take
            if take == block["minutes"]:
                blocks.pop(0)
            else:
                blocks[0] = {**block, "minutes": block["minutes"] - take}
        days.append({"date": (today + timedelta(days=index)).isoformat(), "blocks": day_blocks})
    plan = {"days": days, "budget_minutes": budget, "rationale": "Prioritizes weak, important concepts and reviews at-risk memories."}
    previous = db.query(StudyPlan).filter_by(user_id=user_id, course_id=course_id, status="active").order_by(StudyPlan.created_at.desc()).first()
    diff = compute_diff((previous.plan_data if previous else {}).get("days", []), days)
    if previous:
        previous.status = "superseded"
    db.add(StudyPlan(user_id=user_id, course_id=course_id, title="Adaptive study plan", target_date=exam_date, topics_priority=order, plan_data={**plan, "diff": diff}))
    db.commit()
    return {**plan, "diff": diff}


def _positions(days: list[dict[str, Any]]) -> dict[str, int]:
    position: dict[str, int] = {}
    for day_index, day in enumerate(days):
        for block in day.get("blocks", []):
            position.setdefault(str(block["concept_id"]), day_index)
    return position


def compute_diff(previous: list[dict[str, Any]], current: list[dict[str, Any]]) -> dict[str, Any]:
    old, new = _positions(previous), _positions(current)
    moved_up = [concept_id for concept_id in new if concept_id in old and new[concept_id] < old[concept_id]]
    moved_down = [concept_id for concept_id in new if concept_id in old and new[concept_id] > old[concept_id]]
    return {
        "moved_up": moved_up, "moved_down": moved_down,
        "added": [item for item in new if item not in old],
        "removed": [item for item in old if item not in new],
    }


def replan_on_mastery_change(db: Session, user_id: str, course_id: str) -> dict[str, Any]:
    return build_plan(db, user_id, course_id)
