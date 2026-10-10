"""Misconception dashboard and remediation endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.models.db import Misconception, UserMisconception
from backend.api.routers.learner import _default_user
from services.learner_model.misconceptions import (
    generate_remediation_pack,
    get_active_misconceptions,
    update_misconception_severity,
)

router = APIRouter(tags=["Misconceptions"])


class RemediationRequest(BaseModel):
    user_id: str | None = None


class CheckRequest(BaseModel):
    discriminating_q_response: str
    followup_q_response: str
    user_id: str | None = None


@router.get("/learner/misconceptions")
def list_misconceptions(course_id: str, user_id: str | None = None, db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    return get_active_misconceptions(db, _default_user(db, user_id), course_id)


@router.post("/misconceptions/{misconception_id}/remediate")
def remediate(misconception_id: str, payload: RemediationRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    user_id = _default_user(db, payload.user_id)
    try:
        return generate_remediation_pack(db, user_id, misconception_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/misconceptions/{misconception_id}/check")
def check_remediation(misconception_id: str, payload: CheckRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    user_id = _default_user(db, payload.user_id)
    row = db.query(UserMisconception).filter_by(user_id=user_id, misconception_id=misconception_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="User misconception not found")
    pack = row.remediation_pack or {}
    answers = {str(pack.get("discriminating_answer", "")).strip().lower(), str(pack.get("followup_answer", "")).strip().lower()}
    both_correct = bool(answers and payload.discriminating_q_response.strip().lower() in answers and payload.followup_q_response.strip().lower() in answers)
    before = row.severity
    if both_correct:
        update_misconception_severity(db, user_id, misconception_id, "correct_answer")
        update_misconception_severity(db, user_id, misconception_id, "correct_answer")
    db.commit()
    return {"both_correct": both_correct, "severity_change": row.severity - before,
            "mastery_delta": {"concept_a": 0.05 if both_correct else 0.0, "concept_b": 0.05 if both_correct else 0.0}}
