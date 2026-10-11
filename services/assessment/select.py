"""Adaptive assessment question selection."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from services.learner_model.bkt import GUESS, p_eff, slip


def cosine(left: list[float] | None, right: list[float] | None) -> float:
    if not left or not right:
        return 0.0
    denom = math.sqrt(sum(x * x for x in left) * sum(x * x for x in right))
    return sum(x * y for x, y in zip(left, right)) / denom if denom else 0.0


def _value(item: Any, name: str, default: Any = None) -> Any:
    return getattr(item, name, default) if not isinstance(item, dict) else item.get(name, default)


def score(q: Any, learner_state: dict[str, Any]) -> float:
    """Score a candidate question using learner need, fit, novelty, and decay."""
    concept_id = str(_value(q, "concept_id"))
    mastery = learner_state.get("mastery", {}).get(concept_id, {})
    p = float(mastery.get("p_eff", mastery.get("p", 0.3)))
    prereq_values = [
        float(learner_state.get("mastery", {}).get(str(item), {}).get("p_eff", 0.3))
        for item in learner_state.get("prerequisites", {}).get(concept_id, [])
    ]
    difficulty = float(_value(q, "difficulty", 0.5))
    qtype = str(_value(q, "question_type", "conceptual"))
    predicted = p * (1 - slip(difficulty)) + (1 - p) * GUESS.get(qtype, 0.1)
    last_seen = mastery.get("last_seen")
    if isinstance(last_seen, str):
        last_seen = datetime.fromisoformat(last_seen)
    now = learner_state.get("now") or datetime.now(timezone.utc)
    if last_seen is None:
        risk = 0.0
    else:
        if last_seen.tzinfo is None:
            last_seen = last_seen.replace(tzinfo=timezone.utc)
        risk = 1 - math.exp(
            -max(0.0, (now - last_seen).total_seconds() / 86400.0)
            / max(float(mastery.get("half_life", 3.0)), 0.001)
        )
    served_embeddings = learner_state.get("served_embeddings", [])
    novelty = 1 - max(
        (cosine(_value(q, "embedding"), item) for item in served_embeddings), default=0.0
    )
    served = str(_value(q, "id")) in {str(item) for item in learner_state.get("served_ids", [])}
    scope = learner_state.get("scope")
    in_scope = 1.0 if not scope or concept_id in {str(item) for item in scope} else 0.3
    penalty = 1.0 if served else 0.5 if novelty < 0.1 else 0.0
    return (
        in_scope
        * (
            0.35 * (1 - p)
            + 0.20 * max([1 - value for value in prereq_values], default=0.0)
            + 0.20 * (1 - abs(predicted - 0.7))
            + 0.15 * novelty
            + 0.10 * risk
        )
        - penalty
    )


def why_selected(q: Any, learner_state: dict[str, Any]) -> str:
    concept_id = str(_value(q, "concept_id"))
    mastery = learner_state.get("mastery", {}).get(concept_id, {})
    p = float(mastery.get("p_eff", mastery.get("p", 0.3)))
    tags = [f"Weak ({round(p * 100)}%)"]
    difficulty = float(_value(q, "difficulty", 0.5))
    if abs(difficulty - p) < 0.25:
        tags.append("difficulty matched")
    prereq_names = learner_state.get("prerequisite_names", {}).get(concept_id, [])
    if prereq_names:
        tags.append(f"prereq of {prereq_names[0]}")
    return " · ".join(tags)


def softmax_sample(
    candidates: list[Any], learner_state: dict[str, Any], temperature: float = 0.3
) -> Any:
    """Return the highest-probability candidate from a stable top-three sample."""
    ranked = sorted(candidates, key=lambda q: score(q, learner_state), reverse=True)[:3]
    if not ranked:
        return None
    weights = [math.exp(score(q, learner_state) / max(temperature, 0.01)) for q in ranked]
    return ranked[max(range(len(weights)), key=lambda index: weights[index])]


def next_question(
    assessment_id: str, db_session: Any, user_id: str | None = None
) -> dict[str, Any] | None:
    """Select and register the next approved question for an assessment."""
    from backend.models.db import (
        Assessment,
        Attempt,
        LearnerMastery,
        Misconception,
        Prerequisite,
        Question,
        UserMisconception,
    )

    assessment = db_session.get(Assessment, assessment_id)
    if assessment is None:
        raise ValueError("Assessment not found")
    resolved_user = user_id or assessment.user_id
    config = dict(assessment.config or {})
    served_ids = list(config.get("served_ids", []))
    attempts = db_session.query(Attempt).filter(Attempt.assessment_id == assessment.id).all()
    answered_ids = {str(item.question_id) for item in attempts}
    served_ids = list(dict.fromkeys([*served_ids, *answered_ids]))
    candidates = (
        db_session.query(Question)
        .filter(
            Question.status == "approved",
            Question.id.notin_(served_ids or [""]),
            Question.concept_id.in_(config.get("concept_ids", [])),
        )
        .all()
    )
    if not candidates:
        return None
    mastery = {
        str(item.concept_id): {
            "p": item.p_know,
            "p_eff": p_eff(item.p_know, item.half_life, item.last_practiced_at),
            "half_life": item.half_life,
            "last_seen": item.last_practiced_at,
        }
        for item in db_session.query(LearnerMastery)
        .filter(LearnerMastery.user_id == resolved_user)
        .all()
    }
    prerequisites: dict[str, list[str]] = {}
    for edge in db_session.query(Prerequisite).filter(Prerequisite.kind == "requires").all():
        prerequisites.setdefault(str(edge.concept_id), []).append(str(edge.prerequisite_id))
    weak_prereqs = {
        prerequisite_id
        for values in prerequisites.values()
        for prerequisite_id in values
        if float(mastery.get(prerequisite_id, {}).get("p_eff", 0.3)) < 0.4
    }
    if weak_prereqs:
        prerequisite_candidates = [q for q in candidates if str(q.concept_id) in weak_prereqs]
        if prerequisite_candidates:
            candidates = prerequisite_candidates
    active_rows = (
        db_session.query(UserMisconception)
        .join(Misconception)
        .filter(
            UserMisconception.user_id == resolved_user,
            UserMisconception.status == "active",
            UserMisconception.severity >= 2,
        )
        .all()
    )
    active_ids = {str(row.misconception_id) for row in active_rows}
    discriminating = [
        q
        for q in candidates
        if any(
            str(option.get("misconception_id")) in active_ids
            for option in (q.options or [])
            if isinstance(option, dict)
        )
        or str(getattr(q, "misconception_id", "")) in active_ids
    ]
    if discriminating:
        candidates = discriminating
    misconception_active = bool(active_rows)
    state = {"mastery": mastery, "prerequisites": prerequisites, "scope": config.get("scope", [])}
    selected = softmax_sample(candidates, state)
    if selected is None:
        return None
    served_ids.append(str(selected.id))
    config["served_ids"] = served_ids
    assessment.config = config
    db_session.commit()
    return {
        "question": selected,
        "why_selected": why_selected(selected, state),
        "progress": {"current": len(attempts), "total": assessment.config.get("total", 10)},
        "misconception_active": misconception_active,
    }


def diagnostic_questions(
    candidates: list[Any], learner_state: dict[str, Any], limit: int = 10
) -> list[Any]:
    """Pick the most uncertain candidate from each top-level topic first."""
    selected: list[Any] = []
    topics_seen: set[str] = set()
    ranked = sorted(
        candidates,
        key=lambda q: abs(
            float(
                learner_state.get("mastery", {})
                .get(str(_value(q, "concept_id")), {})
                .get("p_eff", 0.3)
            )
            - 0.5
        ),
    )
    for question in ranked:
        topic_id = str(_value(question, "topic_id", _value(question, "concept_id")))
        if topic_id not in topics_seen:
            selected.append(question)
            topics_seen.add(topic_id)
        if len(selected) >= limit:
            break
    return selected


def mock_exam_questions(candidates: list[Any], total: int = 15) -> list[Any]:
    """Select a deterministic 30/50/20 easy/medium/hard difficulty mix."""
    buckets = {
        "easy": [q for q in candidates if float(_value(q, "difficulty", 0.5)) < 0.4],
        "medium": [q for q in candidates if 0.4 <= float(_value(q, "difficulty", 0.5)) < 0.65],
        "hard": [q for q in candidates if float(_value(q, "difficulty", 0.5)) >= 0.65],
    }
    easy = round(total * 0.3)
    medium = round(total * 0.5)
    counts = {"easy": easy, "medium": medium, "hard": total - easy - medium}
    result: list[Any] = []
    for name, count in counts.items():
        result.extend(buckets[name][:count])
    return result
