"""Learner model endpoints for onboarding and evidence recording."""

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.models.db import User
from services.learner_model.service import (
    get_mastery,
    post_onboarding,
    record_attempt,
    record_conversation_evidence,
)

router = APIRouter(prefix="/learner", tags=["Learner"])


class OnboardingRequest(BaseModel):
    user_id: str | None = None
    course_id: str
    exam_date: date | None = None
    hours_per_week: float = Field(default=10.0, gt=0)
    self_ratings: dict[str, int] = Field(default_factory=dict)


class AttemptRequest(BaseModel):
    user_id: str
    question_id: str
    response: str
    correct: bool
    hint_used: bool = False
    time_ms: int | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    read_feedback: bool = False


class ConversationRequest(BaseModel):
    user_id: str
    message: str
    tutor_cited_concepts: list[str] = Field(default_factory=list)
    tutor_answer: str = ""


def _default_user(db: Session, user_id: str | None) -> str:
    if user_id:
        if db.get(User, user_id) is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user_id
    user = db.query(User).filter(User.email == "student@knowtrace.ai").first()
    if user is None:
        user = User(email="student@knowtrace.ai", name="Default Learner")
        db.add(user)
        db.commit()
        db.refresh(user)
    return str(user.id)


@router.post("/onboarding")
def onboarding(payload: OnboardingRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    user_id = _default_user(db, payload.user_id)
    try:
        return post_onboarding(
            db,
            user_id,
            payload.course_id,
            payload.exam_date,
            payload.hours_per_week,
            payload.self_ratings,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/mastery")
def mastery(
    course_id: str, user_id: str | None = None, db: Session = Depends(get_db)
) -> list[dict[str, Any]]:
    return get_mastery(db, _default_user(db, user_id), course_id)


@router.post("/record-attempt")
def attempt(payload: AttemptRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return record_attempt(
            db,
            payload.user_id,
            payload.question_id,
            payload.response,
            payload.correct,
            payload.hint_used,
            payload.time_ms,
            payload.confidence,
            payload.read_feedback,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/record-conversation")
def conversation(
    payload: ConversationRequest, db: Session = Depends(get_db)
) -> list[dict[str, Any]]:
    return record_conversation_evidence(
        db,
        payload.user_id,
        payload.message,
        payload.tutor_cited_concepts,
        payload.tutor_answer,
    )
