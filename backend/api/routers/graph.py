"""Knowledge graph and adaptive study-plan endpoints."""

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.api.routers.learner import _default_user
from backend.core.db import get_db
from backend.models.db import Concept, Course, LearnerMastery, Misconception, Prerequisite, Topic, StudyPlan, Question
from services.learner_model.bkt import p_eff
from services.learner_model.planner import build_plan, replan_on_mastery_change

router = APIRouter(tags=["Graph and Study Plan"])


@router.get("/courses/{course_id}/graph")
def course_graph(course_id: str, user_id: str | None = None, db: Session = Depends(get_db)) -> dict[str, Any]:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    resolved_user = _default_user(db, user_id) if user_id else None
    concepts = db.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
    concept_ids = [str(item.id) for item in concepts]
    mastery = {}
    if resolved_user:
        mastery = {
            str(item.concept_id): {
                "p_eff": p_eff(item.p_know, item.half_life, item.last_practiced_at),
                "n_obs": item.n_obs,
            }
            for item in db.query(LearnerMastery).filter(
                LearnerMastery.user_id == resolved_user,
                LearnerMastery.concept_id.in_(concept_ids),
            ).all()
        }
    nodes = []
    for topic in db.query(Topic).filter(Topic.course_id == course_id).all():
        nodes.append({"id": str(topic.id), "type": "topic", "name": topic.name, "importance": 1.0})
    for concept in concepts:
        question_counts: dict[str, int] = {}
        for question in db.query(Question).filter(Question.concept_id == concept.id).all():
            question_counts[question.question_type] = question_counts.get(question.question_type, 0) + 1
        nodes.append({
            "id": str(concept.id), "type": "concept", "name": concept.name,
            "description": concept.description, "importance": concept.importance,
            "question_counts": question_counts,
            **mastery.get(str(concept.id), {}),
        })
    edges = [
        {"from": str(concept.topic_id), "to": str(concept.id), "kind": "contains", "confidence": 1.0}
        for concept in concepts
    ]
    prerequisite_rows = db.query(Prerequisite).filter(
        Prerequisite.concept_id.in_(concept_ids), Prerequisite.prerequisite_id.in_(concept_ids)
    ).all()
    edges.extend(
        {"from": str(edge.prerequisite_id), "to": str(edge.concept_id), "kind": "requires", "confidence": edge.confidence}
        for edge in prerequisite_rows
    )
    edges.extend(
        {"from": str(item.concept_a), "to": str(item.concept_b), "kind": "confusable", "confidence": 1.0}
        for item in db.query(Misconception).filter(
            Misconception.concept_a.is_not(None), Misconception.concept_b.is_not(None),
        ).all()
        if str(item.concept_a) in concept_ids and str(item.concept_b) in concept_ids
    )
    return {"nodes": nodes, "edges": edges}


class PlanRequest(BaseModel):
    user_id: str | None = None
    exam_date: date | None = None


def _plan_for(db: Session, user_id: str, course_id: str) -> dict[str, Any]:
    row = db.query(StudyPlan).filter_by(
        user_id=user_id, course_id=course_id, status="active"
    ).order_by(StudyPlan.created_at.desc()).first()
    return row.plan_data if row else build_plan(db, user_id, course_id)


@router.get("/study-plan")
def get_study_plan(course_id: str, user_id: str | None = None, db: Session = Depends(get_db)) -> dict[str, Any]:
    return _plan_for(db, _default_user(db, user_id), course_id)


@router.post("/study-plan/regenerate")
def regenerate_plan(payload: PlanRequest, course_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    user_id = _default_user(db, payload.user_id)
    if payload.exam_date:
        course = db.get(Course, course_id)
        if course:
            course.exam_date = payload.exam_date
            db.commit()
    return replan_on_mastery_change(db, user_id, course_id)
