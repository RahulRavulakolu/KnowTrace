"""Detection, severity tracking, and remediation state for misconceptions."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.orm import Session

from backend.core.llm import call_llm
from backend.models.db import Attempt, Concept, Misconception, Question, Topic, UserMisconception
from services.learner_model.prompts import P20_REMEDIATION_PACK


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _misconception(db: Session, misconception_id: str) -> Misconception | None:
    return db.get(Misconception, misconception_id)


def detect_misconception(attempt: Attempt, grading_result: dict[str, Any], db: Session | None = None) -> str | None:
    """Return a tagged misconception, never infer one from an untagged wrong answer."""
    tagged = grading_result.get("misconception_id")
    if tagged:
        return str(tagged)
    question = getattr(attempt, "question", None)
    options = getattr(question, "options", None) if question is not None else None
    if isinstance(question, dict):
        options = question.get("options")
    answer = str(getattr(attempt, "user_answer", "") if not isinstance(attempt, dict) else attempt.get("user_answer", "")).strip().lower()
    for option in options or []:
        if not isinstance(option, dict):
            continue
        key = str(option.get("key", option.get("value", ""))).lower()
        if key == answer and option.get("misconception_id"):
            return str(option["misconception_id"])
    return None


def update_misconception_severity(
    db: Session,
    user_id: str,
    misconception_id: str,
    evidence: str,
    attempt_id: str | None = None,
    confidence: float | None = None,
) -> UserMisconception:
    item = db.query(UserMisconception).filter_by(
        user_id=user_id, misconception_id=misconception_id
    ).first()
    if item is None:
        item = UserMisconception(user_id=user_id, misconception_id=misconception_id)
        db.add(item)
        db.flush()
    if evidence == "wrong_answer":
        item.severity += 1.3 if (confidence or 0.0) >= 0.8 else 1.0
    elif evidence == "correct_answer":
        item.severity -= 1.0
    elif evidence == "explained":
        item.severity -= 0.2
    item.severity = max(0.0, min(5.0, item.severity))
    if attempt_id and attempt_id not in (item.evidence_attempt_ids or []):
        item.evidence_attempt_ids = [*(item.evidence_attempt_ids or []), attempt_id]
    item.last_updated = _now()
    item.status = "active" if item.severity >= 2 and item.last_updated >= _now() - timedelta(days=14) else "resolved"
    db.flush()
    return item


def get_active_misconceptions(db: Session, user_id: str, course_id: str) -> list[dict[str, Any]]:
    cutoff = _now() - timedelta(days=14)
    rows = db.query(UserMisconception).join(Misconception).outerjoin(Concept, Misconception.concept_id == Concept.id).outerjoin(Topic).filter(
        UserMisconception.user_id == user_id,
        (Misconception.course_id == course_id) | (Topic.course_id == course_id),
        UserMisconception.status == "active",
        UserMisconception.last_updated >= cutoff,
        UserMisconception.severity >= 2,
    ).all()
    return [{"misconception_id": row.misconception_id, "severity": row.severity,
             "status": row.status, "evidence": row.evidence_attempt_ids or [],
             "label": row.misconception.label, "description": row.misconception.description}
            for row in rows]


def is_misconception_active(db: Session, user_id: str, misconception_id: str) -> bool:
    row = db.query(UserMisconception).filter_by(
        user_id=user_id, misconception_id=misconception_id, status="active"
    ).first()
    return bool(row and row.severity >= 2 and row.last_updated >= _now() - timedelta(days=14))


def generate_remediation_pack(db: Session, user_id: str, misconception_id: str) -> dict[str, Any]:
    misconception = _misconception(db, misconception_id)
    if misconception is None:
        raise ValueError("Misconception not found")
    concept_a = misconception.concept_a or misconception.concept_id
    concept_b = misconception.concept_b or misconception.concept_id
    row = db.query(UserMisconception).filter_by(user_id=user_id, misconception_id=misconception_id).first()
    wrong_answers = []
    if row:
        attempts = db.query(Attempt).filter(Attempt.id.in_(row.evidence_attempt_ids or [])).all()
        wrong_answers = [attempt.user_answer for attempt in attempts]
    prompt = P20_REMEDIATION_PACK.format(
        concept_a=concept_a, concept_b=concept_b,
        description=misconception.description, wrong_answers=wrong_answers,
        source_chunks=[],
    )
    response = getattr(call_llm("A", prompt, json_schema={"type": "object"}), "data", {})
    pack = response if isinstance(response, dict) else {}
    required = ("explanation", "worked_example", "analogy", "discriminating_question", "followup_question")
    public_pack = {key: str(pack.get(key, "")) for key in required}
    if row:
        row.remediation_pack = {
            **public_pack,
            "discriminating_answer": str(pack.get("discriminating_answer", "")),
            "followup_answer": str(pack.get("followup_answer", "")),
        }
    db.commit()
    return public_pack
