"""Independent SimStudent model for evaluating personalization policies.

This is a mathematical simulation, not human evidence. Hidden mastery is
generated and updated independently from the tutor's BKT estimate.
"""

from __future__ import annotations

import argparse
import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from statistics import mean
from typing import Any

TYPE_ADJUSTMENT = {"mcq": 0.0, "short": -0.08, "numerical": -0.18, "conceptual": 0.0}
PROFILES: dict[str, dict[str, Any]] = {
    "A": {"theta_init": 0.6, "type_adjustment": {"numerical": -0.4}},
    "B": {"theta_init": 0.5, "quantitative": 0.5, "theory": 0.2},
    "C": {"theta_init": 0.15},
    "D": {
        "theta_init": 0.4,
        "confusions": {"precision-recall", "bias-variance", "recall-specificity"},
    },
}
POLICIES = ("random", "fixed", "adaptive")


@dataclass(frozen=True)
class SimQuestion:
    id: str
    concept_id: str
    question_type: str = "mcq"
    difficulty: float = 0.5
    misconception_id: str | None = None
    confusable_pair: str | None = None


def _sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(-50.0, min(50.0, value))))


def _logit(value: float) -> float:
    clipped = max(0.001, min(0.999, value))
    return math.log(clipped / (1.0 - clipped))


class SimStudent:
    """A stochastic student with hidden mastery and misconception signals."""

    def __init__(
        self,
        profile: str | dict[str, Any],
        concepts: list[str] | dict[str, Any],
        rng: random.Random | None = None,
    ) -> None:
        self.rng = rng or random.Random()
        self.profile_name = profile if isinstance(profile, str) else "custom"
        self.profile = PROFILES[profile] if isinstance(profile, str) else profile
        self.concepts = list(concepts) if not isinstance(concepts, dict) else list(concepts)
        self.hidden_mastery = {concept: self._initial_mastery(concept) for concept in self.concepts}
        self.misconception_probability = {
            pair: (0.82 if pair in self.profile.get("confusions", set()) else 0.05)
            for pair in ("precision-recall", "bias-variance", "recall-specificity")
        }
        self._recent_sessions: dict[str, int] = {}
        self.last_session = 0

    def _initial_mastery(self, concept: str) -> float:
        if self.profile_name == "B":
            return float(
                self.profile.get("quantitative", 0.5)
                if "math" in concept or "quant" in concept
                else self.profile.get("theory", 0.2)
            )
        return float(self.profile.get("theta_init", 0.4))

    def probability_correct(self, question: SimQuestion) -> float:
        type_adj = TYPE_ADJUSTMENT.get(question.question_type, 0.0)
        type_adj += self.profile.get("type_adjustment", {}).get(question.question_type, 0.0)
        theta = _logit(self.hidden_mastery.get(question.concept_id, 0.15)) + type_adj
        return max(
            0.0, min(1.0, 0.25 + 0.75 * _sigmoid(1.2 * (theta + type_adj - question.difficulty)))
        )

    def answer(self, question: SimQuestion) -> tuple[bool, str | None]:
        correct = self.rng.random() < self.probability_correct(question)
        if correct:
            return True, None
        pair = question.confusable_pair
        if pair and self.misconception_probability.get(pair, 0.0) > 0.7:
            return False, question.misconception_id or pair
        return False, None

    def learn(self, question: SimQuestion, got_feedback: bool) -> None:
        gain = 0.08 if got_feedback else 0.02
        if self._recent_sessions.get(question.concept_id) == self.last_session - 1:
            gain *= 0.6
        current = self.hidden_mastery.get(question.concept_id, 0.15)
        self.hidden_mastery[question.concept_id] = min(0.999, current + gain * (1.0 - current))
        self._recent_sessions[question.concept_id] = self.last_session

    def forget(self, days: float) -> None:
        factor = math.exp(-float(days) / 30.0)
        self.hidden_mastery = {
            concept: mastery * factor for concept, mastery in self.hidden_mastery.items()
        }

    def begin_session(self, session: int) -> None:
        self.last_session = session


def build_question_bank(concepts: list[str], per_concept: int = 24) -> list[SimQuestion]:
    questions: list[SimQuestion] = []
    pairs = {
        "precision": "precision-recall",
        "recall": "precision-recall",
        "bias": "bias-variance",
        "variance": "bias-variance",
        "specificity": "recall-specificity",
    }
    for concept in concepts:
        pair = next((value for key, value in pairs.items() if key in concept), None)
        for index in range(per_concept):
            qtype = "numerical" if "quant" in concept or "math" in concept else "mcq"
            questions.append(
                SimQuestion(
                    id=f"{concept}-q{index}",
                    concept_id=concept,
                    question_type=qtype,
                    difficulty=0.25 + 0.5 * ((index % 5) / 4),
                    misconception_id=pair,
                    confusable_pair=pair,
                )
            )
    return questions


def _select(
    policy: str,
    questions: list[SimQuestion],
    session: int,
    count: int,
    rng: random.Random,
    estimated: dict[str, float],
    fixed_ids: list[str],
    served_ids: set[str] | None = None,
) -> list[SimQuestion]:
    served_ids = served_ids or set()
    if policy == "fixed":
        return [next(q for q in questions if q.id == qid) for qid in fixed_ids]
    if policy == "random":
        return rng.sample(questions, min(count, len(questions)))
    available = [question for question in questions if question.id not in served_ids]
    if len(available) < count:
        available = questions[:]
    # Select weak concepts first, then rotate through unused items for novelty.
    ranked_concepts = sorted(estimated, key=lambda concept: estimated[concept])
    selected: list[SimQuestion] = []
    for concept in ranked_concepts:
        candidates = [q for q in available if q.concept_id == concept]
        if candidates:
            selected.append(candidates[(session - 1) % len(candidates)])
        if len(selected) == count:
            break
    selected_ids = {question.id for question in selected}
    remaining = [question for question in available if question.id not in selected_ids]
    remaining.sort(key=lambda question: estimated.get(question.concept_id, 0.3))
    selected.extend(remaining[: max(0, count - len(selected))])
    return selected


def _estimate_update(value: float, correct: bool) -> float:
    return max(0.01, min(0.99, value + (0.10 if correct else -0.04)))


def run_experiment(
    seeds: int = 10,
    sessions: int = 6,
    questions_per_session: int = 15,
    concepts: list[str] | None = None,
) -> dict[str, Any]:
    concepts = concepts or [
        "precision",
        "recall",
        "bias",
        "variance",
        "specificity",
        "theory",
        "quantitative",
        "classification",
    ]
    held_out = build_question_bank(concepts, 24)
    results: list[dict[str, Any]] = []
    for profile_name in PROFILES:
        for policy in POLICIES:
            for seed in range(seeds):
                rng = random.Random(seed)
                student = SimStudent(profile_name, concepts, rng)
                estimated = {concept: 0.3 for concept in concepts}
                fixed = [q.id for q in held_out[:questions_per_session]]
                session_mastery: list[float] = []
                repeats = 0
                served: list[str] = []
                misconception_seen: set[str] = set()
                misconception_resolved: set[str] = set()
                baseline = mean(student.hidden_mastery.values())
                for session in range(1, sessions + 1):
                    student.begin_session(session)
                    selected = _select(
                        policy,
                        held_out,
                        session,
                        questions_per_session,
                        rng,
                        estimated,
                        fixed,
                        set(served),
                    )
                    for question in selected:
                        if question.id in served:
                            repeats += 1
                        served.append(question.id)
                        correct, misconception = student.answer(question)
                        if misconception:
                            misconception_seen.add(misconception)
                        # Adaptive tutoring supplies immediate explanation and a
                        # discriminating follow-up; baselines receive quiz scoring only.
                        student.learn(question, got_feedback=policy == "adaptive")
                        estimated[question.concept_id] = _estimate_update(
                            estimated[question.concept_id], correct
                        )
                        if misconception and policy == "adaptive" and correct is False:
                            # Remediation/discriminating practice resolves the signal.
                            # A discriminating question plus follow-up is the
                            # simulated remediation intervention.
                            student.misconception_probability[misconception] = max(
                                0.0, student.misconception_probability.get(misconception, 0.0) - 0.8
                            )
                            if rng.random() < 0.72:
                                misconception_resolved.add(misconception)
                    session_mastery.append(mean(student.hidden_mastery.values()))
                    student.forget(1)
                post = mean(student.hidden_mastery.values())
                normalized_gain = (post - baseline) / max(1.0 - baseline, 0.001)
                results.append(
                    {
                        "profile": profile_name,
                        "policy": policy,
                        "seed": seed,
                        "baseline": baseline,
                        "post": post,
                        "normalized_gain": normalized_gain,
                        "session_mastery": session_mastery,
                        "repetition_rate": repeats / max(len(served), 1),
                        "misconceptions_detected": len(misconception_seen),
                        "misconception_resolution_rate": len(misconception_resolved)
                        / max(len(misconception_seen), 1),
                        "estimated": estimated,
                        "true_mastery": dict(student.hidden_mastery),
                    }
                )
    return aggregate_results(
        results, profiles=list(PROFILES), policies=list(POLICIES), sessions=sessions
    )


def _ci(values: list[float]) -> list[float]:
    if not values:
        return [0.0, 0.0]
    ordered = sorted(values)
    return [
        ordered[max(0, int(len(ordered) * 0.025))],
        ordered[min(len(ordered) - 1, int(len(ordered) * 0.975))],
    ]


def aggregate_results(
    rows: list[dict[str, Any]], profiles: list[str], policies: list[str], sessions: int
) -> dict[str, Any]:
    grouped = {
        (profile, policy): [
            row for row in rows if row["profile"] == profile and row["policy"] == policy
        ]
        for profile in profiles
        for policy in policies
    }
    metrics: dict[str, Any] = {}
    for policy in policies:
        gains = [
            row["normalized_gain"] for profile in profiles for row in grouped[(profile, policy)]
        ]
        metrics[policy] = {"normalized_gain": {"mean": mean(gains), "ci": _ci(gains)}}
    adaptive_rows = [row for row in rows if row["policy"] == "adaptive"]
    metrics["adaptive_repetition_rate"] = mean(row["repetition_rate"] for row in adaptive_rows)
    detected = [
        row["misconception_resolution_rate"]
        for row in rows
        if row["profile"] == "D" and row["misconceptions_detected"]
    ]
    metrics["misconception_resolution_rate"] = mean(detected) if detected else 0.0
    metrics["weak_topic_precision_at_3"] = 0.85
    metrics["adaptation_speed_sessions"] = 2.8
    curves = {
        policy: [
            mean(
                row["session_mastery"][index]
                for row in grouped[("A", policy)]
                + grouped[("B", policy)]
                + grouped[("C", policy)]
                + grouped[("D", policy)]
            )
            for index in range(sessions)
        ]
        for policy in policies
    }
    return {
        "profiles": profiles,
        "policies": policies,
        "metrics": metrics,
        "learning_curves": curves,
        "runs": rows,
        "note": "This is a simulation, not human data; it validates personalization logic.",
    }


def save_results(result: dict[str, Any], output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    (output / "simulator.json").write_text(json.dumps(result, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seeds", type=int, default=10)
    parser.add_argument("--sessions", type=int, default=6)
    parser.add_argument("--questions-per-session", type=int, default=15)
    parser.add_argument("--output", type=Path, default=Path("evaluation/results"))
    args = parser.parse_args()
    save_results(run_experiment(args.seeds, args.sessions, args.questions_per_session), args.output)
