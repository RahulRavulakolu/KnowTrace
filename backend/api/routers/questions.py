"""Question generation, validation, and grading endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.models.db import Concept, ContentChunk, Question
from services.assessment.generate import generate_question
from services.assessment.grade import grade_question
from services.assessment.validate import validate_and_persist

router = APIRouter(prefix="/questions", tags=["Questions"])


class GenerateRequest(BaseModel):
    concept_id: str
    type: str = Field(pattern="^(mcq|short|numerical|conceptual)$")
    target_difficulty: float = Field(default=0.5, ge=0, le=1)
    confusables: list[str] = Field(default_factory=list)


class GradeRequest(BaseModel):
    response: str


@router.post("/generate")
def generate(payload: GenerateRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        draft = generate_question(
            payload.concept_id, payload.type, payload.target_difficulty,
            payload.confusables, db,
        )
        question = Question(
            concept_id=payload.concept_id,
            question_text=str(draft.get("stem", "")),
            question_type=payload.type,
            options=draft.get("options", []),
            correct_answer=str(draft.get("answer", "")),
            explanation=str(draft.get("explanation", "")),
            difficulty=float(draft.get("difficulty_estimate", payload.target_difficulty)),
            status="draft",
            support_span=str(draft.get("support_span", "")),
            source_chunk_id=draft.get("source_chunk_id"),
            numerical_python=draft.get("numerical_python"),
            marking_rubric=draft.get("marking_rubric"),
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        draft["id"] = str(question.id)
        return {"question": draft}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{question_id}/validate")
def validate(question_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    if not question.source_chunk_id:
        raise HTTPException(status_code=422, detail="Question has no source chunk")
    chunk = db.get(ContentChunk, question.source_chunk_id)
    concept = db.get(Concept, question.concept_id)
    if chunk is None or concept is None:
        raise HTTPException(status_code=422, detail="Question provenance is incomplete")
    return validate_and_persist(question, chunk, concept, db)


@router.post("/{question_id}/grade")
def grade(question_id: str, payload: GradeRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.status != "approved":
        raise HTTPException(status_code=409, detail="Only approved questions can be graded")
    return grade_question(question, payload.response)
