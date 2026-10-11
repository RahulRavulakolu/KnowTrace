"""Adaptive assessment lifecycle endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.models.db import Assessment, Attempt, Concept, Course, Question, Topic, User
from services.assessment.grade import grade_question
from services.assessment.report import generate_report
from services.assessment.select import next_question
from services.learner_model.misconceptions import get_active_misconceptions
from services.learner_model.planner import replan_on_mastery_change
from services.learner_model.service import record_attempt

router = APIRouter(prefix="/assessments", tags=["Assessments"])


class AssessmentCreate(BaseModel):
    course_id: str
    kind: str = Field(pattern="^(diagnostic|quiz|mock)$")
    scope: list[str] = Field(default_factory=list)
    types: list[str] = Field(default_factory=lambda: ["mcq", "short", "numerical", "conceptual"])
    n: int = Field(default=10, ge=1, le=100)
    user_id: str | None = None


class SubmitRequest(BaseModel):
    question_id: str
    response: str
    confidence: int = Field(default=3, ge=1, le=5)
    hint_used: bool = False
    time_ms: int | None = None


def _user(db: Session, user_id: str | None) -> User:
    if user_id:
        user = db.get(User, user_id)
        if user:
            return user
    user = db.query(User).filter(User.email == "student@knowtrace.ai").first()
    if user is None:
        user = User(email="student@knowtrace.ai", name="Default Learner")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.post("")
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    if db.get(Course, payload.course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    user = _user(db, payload.user_id)
    query = (
        db.query(Question)
        .join(Concept)
        .join(Topic)
        .filter(
            Question.status == "approved",
            Question.question_type.in_(payload.types),
            Topic.course_id == payload.course_id,
        )
    )
    if payload.scope:
        query = query.filter(
            Question.concept_id.in_(
                db.query(Concept.id).filter(Concept.topic_id.in_(payload.scope))
            )
        )
    concept_ids = [
        str(item) for (item,) in query.with_entities(Question.concept_id).distinct().all()
    ]
    assessment = Assessment(
        course_id=payload.course_id,
        user_id=user.id,
        title=f"{payload.kind.title()} assessment",
        assessment_type=payload.kind,
        question_ids=[],
        config={
            "scope": payload.scope,
            "types": payload.types,
            "total": payload.n,
            "concept_ids": concept_ids,
            "served_ids": [],
            "kind": payload.kind,
        },
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {
        "assessment_id": str(assessment.id),
        "kind": payload.kind,
        "scope": payload.scope,
        "created_at": assessment.created_at,
    }


@router.post("/{assessment_id}/next")
def get_next(assessment_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    result = next_question(assessment_id, db)
    if result is None:
        raise HTTPException(status_code=404, detail="No more approved questions")
    question = result["question"]
    return {
        **result,
        "question": {
            "id": str(question.id),
            "concept_id": str(question.concept_id),
            "type": question.question_type,
            "stem": question.question_text,
            "options": question.options,
            "difficulty": question.difficulty,
        },
    }


@router.post("/{assessment_id}/submit")
def submit(
    assessment_id: str, payload: SubmitRequest, db: Session = Depends(get_db)
) -> dict[str, Any]:
    assessment = db.get(Assessment, assessment_id)
    question = db.get(Question, payload.question_id)
    if assessment is None or question is None:
        raise HTTPException(status_code=404, detail="Assessment or question not found")
    before = (
        db.query(Attempt)
        .filter(Attempt.assessment_id == assessment_id, Attempt.question_id == question.id)
        .count()
    )
    if before:
        raise HTTPException(status_code=409, detail="Question already submitted")
    result = grade_question(question, payload.response)
    mastery = record_attempt(
        db,
        assessment.user_id or "",
        question.id,
        payload.response,
        result["correct"],
        payload.hint_used,
        payload.time_ms,
        payload.confidence / 5.0,
        assessment_id=assessment_id,
        feedback=result["feedback"],
        misconception_id=result.get("misconception_id"),
    )
    active = get_active_misconceptions(db, assessment.user_id or "", assessment.course_id)
    plan = replan_on_mastery_change(db, assessment.user_id or "", assessment.course_id)
    return {
        "correct": result["correct"],
        "feedback": result["feedback"],
        "explanation": question.explanation,
        "citation": {
            "type": "source",
            "label": question.support_span or "Source evidence",
            "link": f"/view/{question.source_chunk_id}",
        },
        "misconception_id": result.get("misconception_id"),
        "mastery_delta": mastery["p"] - 0.3,
        "likely_root_cause": None,
        "misconception_active": bool(active),
        "study_plan_diff": plan.get("diff", {}),
    }


@router.get("/{assessment_id}/report")
def report(assessment_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    assessment = db.get(Assessment, assessment_id)
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    cached = (assessment.config or {}).get("report")
    return cached or generate_report(assessment_id, db)
