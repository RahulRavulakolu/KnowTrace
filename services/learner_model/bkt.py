"""Bayesian Knowledge Tracing with lightweight forgetting and evidence weights."""

from __future__ import annotations

from datetime import datetime, timezone
from math import exp
from typing import Any

GUESS = {"mcq": 0.25, "short": 0.10, "numerical": 0.05, "conceptual": 0.10}
MIN_MASTERY = 0.02
MAX_MASTERY = 0.98
INITIAL_HALF_LIFE = 3.0
MAX_HALF_LIFE = 60.0


def clip(value: float) -> float:
    return max(MIN_MASTERY, min(MAX_MASTERY, float(value)))


def slip(difficulty: float) -> float:
    return max(0.0, min(1.0, 0.05 + 0.10 * float(difficulty)))


def p_eff(
    p: float,
    half_life: float = INITIAL_HALF_LIFE,
    last_seen: datetime | None = None,
    prior: float = 0.3,
    now: datetime | None = None,
) -> float:
    """Return mastery decayed toward the cold-start prior."""
    if last_seen is None:
        return clip(p)
    current = now or datetime.now(timezone.utc)
    seen = last_seen
    if seen.tzinfo is None:
        seen = seen.replace(tzinfo=timezone.utc)
    delta_days = max(0.0, (current - seen).total_seconds() / 86400.0)
    return clip(prior + (float(p) - prior) * exp(-delta_days / max(float(half_life), 0.001)))


def update(
    p: float,
    qtype: str,
    difficulty: float,
    correct: bool,
    hint: bool = False,
    fast: bool = False,
    confidence: float | None = None,
    read_feedback: bool = False,
) -> dict[str, Any]:
    """Apply one BKT observation and return the updated state.

    Evidence modifiers change the observation strength, not the probability
    model itself. This keeps the update bounded and makes hints less diagnostic.
    """
    prior = clip(p)
    guess = GUESS.get(qtype, GUESS["conceptual"])
    slip_rate = slip(difficulty)
    if correct:
        likelihood_correct = prior * (1.0 - slip_rate)
        likelihood_wrong = (1.0 - prior) * guess
        denominator = max(likelihood_correct + likelihood_wrong, 1e-9)
        posterior = likelihood_correct / denominator
    else:
        likelihood_wrong = prior * slip_rate
        likelihood_correct = (1.0 - prior) * (1.0 - guess)
        denominator = max(likelihood_wrong + likelihood_correct, 1e-9)
        posterior = likelihood_wrong / denominator

    weight = 1.0
    if hint:
        weight *= 0.5
    if not correct and confidence is not None and confidence >= 0.75:
        weight *= 1.3
    if fast:
        weight *= 1.1
    if read_feedback:
        weight *= 0.8
    new_p = clip(prior + weight * (posterior - prior))
    new_half_life = min(MAX_HALF_LIFE, INITIAL_HALF_LIFE if not correct else min(MAX_HALF_LIFE, 2 * INITIAL_HALF_LIFE))
    return {"p": new_p, "half_life": new_half_life, "posterior": clip(posterior), "weight": weight}


def next_half_life(current: float, correct: bool) -> float:
    """Double the review interval on success, retaining it on failure."""
    return min(MAX_HALF_LIFE, max(INITIAL_HALF_LIFE, current * 2.0)) if correct else max(INITIAL_HALF_LIFE, current)
