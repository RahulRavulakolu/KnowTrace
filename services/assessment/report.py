"""Post-assessment report generation."""

from __future__ import annotations

from typing import Any

from backend.core.llm import call_llm
from backend.models.db import Assessment, Attempt, Concept, LearnerMastery, Question, Topic
from services.assessment.prompts import P19_REPORT_GENERATION
from services.learner_model.bkt import p_eff


def generate_report(assessment_id: str, db_session: Any) -> dict[str, Any]:
    assessment = db_session.get(Assessment, assessment_id)
    if assessment is None:
        raise ValueError("Assessment not found")
    attempts = db_session.query(Attempt).filter(Attempt.assessment_id == assessment_id).all()
    question_ids = [item.question_id for item in attempts]
    concept_ids = {
        str(concept_id)
        for (concept_id,) in db_session.query(Question.concept_id)
        .filter(Question.id.in_(question_ids or [""]))
        .all()
    }
    if not concept_ids:
        concept_ids = {
            str(concept_id)
            for (concept_id,) in db_session.query(Question.concept_id)
            .join(Concept)
            .join(Topic)
            .filter(Topic.course_id == assessment.course_id)
            .all()
        }
    weak = []
    for concept in db_session.query(Concept).filter(Concept.id.in_(concept_ids or [""])).all():
        mastery = (
            db_session.query(LearnerMastery)
            .filter_by(user_id=assessment.user_id, concept_id=concept.id)
            .first()
        )
        if mastery:
            weak.append(
                {
                    "concept_id": str(concept.id),
                    "concept": concept.name,
                    "p_after": p_eff(mastery.p_know, mastery.half_life, mastery.last_practiced_at),
                }
            )
    weak.sort(key=lambda item: item["p_after"])
    payload = [
        {
            "question_id": str(item.question_id),
            "response": item.user_answer,
            "correct": item.is_correct,
            "misconception_id": item.misconception_id,
        }
        for item in attempts
    ]
    try:
        response = call_llm(
            "A",
            f"{P19_REPORT_GENERATION}\nAttempts: {payload}\nWeak concepts: {weak}",
            json_schema={"type": "object"},
        )
        data = getattr(response, "data", response)
        data = data if isinstance(data, dict) else {}
    except Exception:
        data = {}
    report = {
        "summary": str(data.get("summary", "Assessment complete.")),
        "weak_concepts": weak,
        "misconceptions": data.get("misconceptions", []),
        "root_cause": data.get("root_cause") or (weak[0] if weak else None),
        "actions": data.get("actions", []),
    }
    assessment.config = {**dict(assessment.config or {}), "report": report}
    db_session.commit()
    return report
