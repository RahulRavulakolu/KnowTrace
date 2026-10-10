"""Persistence and orchestration for personalized learner evidence."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.core.llm import call_llm
from backend.models.db import (
    Assessment,
    Attempt,
    Concept,
    Course,
    LearnerMastery,
    MasteryHistory,
    Misconception,
    Prerequisite,
    Question,
    Topic,
    UserMisconception,
)
from services.learner_model.bkt import (
    INITIAL_HALF_LIFE,
    clip,
    next_half_life,
    p_eff,
    update,
)
from services.learner_model.prompts import P13_CONVERSATION_EVIDENCE
from services.learner_model.misconceptions import detect_misconception, update_misconception_severity


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _mastery(db: Session, user_id: str, concept_id: str, prior: float = 0.3) -> LearnerMastery:
    record = db.query(LearnerMastery).filter_by(user_id=user_id, concept_id=concept_id).first()
    if record is None:
        record = LearnerMastery(
            user_id=user_id,
            concept_id=concept_id,
            p_know=prior,
            confidence=0.0,
            n_obs=0,
            half_life=INITIAL_HALF_LIFE,
            history=[],
        )
        db.add(record)
        db.flush()
    return record


def _save_observation(db: Session, record: LearnerMastery, before: float, correct: bool, evidence: str) -> None:
    observed = _now()
    record.history = list(record.history or []) + [{
        "at": observed.isoformat(), "p": record.p_know, "p_eff": p_eff(
            record.p_know, record.half_life, observed, now=observed
        ), "correct": correct, "evidence": evidence,
    }]
    record.n_obs += 1
    record.last_practiced_at = observed
    record.updated_at = observed
    db.add(MasteryHistory(
        user_id=record.user_id, concept_id=record.concept_id, p_before=before,
        p_after=record.p_know, p_eff=record.history[-1]["p_eff"],
        event_type=evidence, correct=correct, created_at=observed,
    ))


def record_attempt(
    db: Session,
    user_id: str,
    question_id: str,
    response: str,
    correct: bool,
    hint_used: bool = False,
    time_ms: int | None = None,
    confidence: float | None = None,
    read_feedback: bool = False,
    assessment_id: str | None = None,
    feedback: str = "",
    misconception_id: str | None = None,
) -> dict[str, Any]:
    """Persist an attempt and update mastery for its question concept."""
    question = db.get(Question, question_id)
    if question is None:
        raise ValueError("Question not found")
    assessment = db.get(Assessment, assessment_id) if assessment_id else db.query(Assessment).filter(
        Assessment.user_id == user_id,
        Assessment.question_ids.contains([question_id]),
    ).first()
    if assessment is None:
        assessment = Assessment(
            course_id=question.concept.topic.course_id if question.concept and question.concept.topic else "",
            user_id=user_id, title="Learner attempt", question_ids=[question_id],
        )
        db.add(assessment)
        db.flush()
    attempt = Attempt(
        assessment_id=assessment.id, user_id=user_id, question_id=question_id,
        user_answer=response, is_correct=correct, score=1.0 if correct else 0.0,
        response_time_ms=time_ms, feedback=feedback, misconception_id=misconception_id,
    )
    db.add(attempt)
    db.flush()
    matched = detect_misconception(attempt, {"misconception_id": misconception_id})
    if matched:
        update_misconception_severity(
            db, user_id, matched, "wrong_answer" if not correct else "correct_answer",
            attempt_id=attempt.id, confidence=confidence,
        )
    record = _mastery(db, user_id, question.concept_id)
    before = record.p_know
    result = update(
        record.p_know, question.question_type, question.difficulty, correct,
        hint_used, bool(time_ms is not None and time_ms < 5000), confidence, read_feedback,
    )
    record.p_know = result["p"]
    record.half_life = next_half_life(record.half_life, correct)
    record.confidence = min(1.0, (record.n_obs + 1) / 5.0)
    _save_observation(db, record, before, correct, "attempt")
    if not correct:
        _propagate_prerequisites(db, user_id, question.concept_id)
    db.commit()
    return {"concept_id": question.concept_id, "p": record.p_know, "p_eff": p_eff(
        record.p_know, record.half_life, record.last_practiced_at
    ), "n_obs": record.n_obs, "misconception_id": matched}


def _propagate_prerequisites(db: Session, user_id: str, concept_id: str) -> None:
    edges = db.query(Prerequisite).filter(
        Prerequisite.concept_id == concept_id, Prerequisite.kind == "requires"
    ).all()
    for edge in edges:
        prereq = _mastery(db, user_id, edge.prerequisite_id)
        effective = p_eff(prereq.p_know, prereq.half_life, prereq.last_practiced_at)
        if effective < 0.4:
            before = prereq.p_know
            prereq.p_know = clip(prereq.p_know - 0.3 * (0.4 - effective))
            _save_observation(db, prereq, before, False, "prerequisite_propagation")


def record_conversation_evidence(
    db: Session,
    user_id: str,
    message: str,
    tutor_cited_concepts: list[str],
    tutor_answer: str = "",
) -> list[dict[str, Any]]:
    """Classify a student turn and apply low-strength mastery evidence."""
    response = call_llm(
        "B",
        f"{P13_CONVERSATION_EVIDENCE}\nStudent: {message}\nTutor answer: {tutor_answer}\n"
        f"Cited concepts: {tutor_cited_concepts}",
        json_schema={"type": "array"},
    )
    data = getattr(response, "data", response)
    evidence = data if isinstance(data, list) else []
    for item in evidence:
        concept_id = str(item.get("concept_id", ""))
        if concept_id not in tutor_cited_concepts:
            continue
        signal = item.get("signal", "basic_question")
        record = _mastery(db, user_id, concept_id)
        before = record.p_know
        if signal == "correct_explanation":
            record.p_know = clip(record.p_know + 0.08)
        elif signal in {"confusion", "misconception"}:
            record.p_know = clip(record.p_know - 0.06)
            misconception = db.query(Misconception).filter(Misconception.concept_id == concept_id).first()
            if misconception:
                update_misconception_severity(db, user_id, misconception.id, "wrong_answer")
        else:
            continue
        record.confidence = min(1.0, (record.n_obs + 1) / 5.0)
        _save_observation(db, record, before, signal == "correct_explanation", "conversation")
    db.commit()
    return evidence


def get_mastery(db: Session, user_id: str, course_id: str) -> list[dict[str, Any]]:
    concepts = db.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
    result = []
    for concept in concepts:
        record = _mastery(db, user_id, concept.id)
        topic = concept.topic
        result.append({
            "concept": {"id": str(concept.id), "name": concept.name},
            "topic": {"id": str(topic.id), "name": topic.name},
            "p": record.p_know, "p_eff": p_eff(record.p_know, record.half_life, record.last_practiced_at),
            "n_obs": record.n_obs, "half_life": record.half_life,
            "last_seen": record.last_practiced_at, "history": record.history or [],
        })
    db.commit()
    return result


def post_onboarding(
    db: Session, user_id: str, course_id: str, exam_date: date | None,
    hours_per_week: float, self_ratings: dict[str, int],
) -> dict[str, Any]:
    course = db.get(Course, course_id)
    if course is None:
        raise ValueError("Course not found")
    course.exam_date = exam_date
    course.hours_per_day = hours_per_week / 7.0
    count = 0
    for topic_id, rating in self_ratings.items():
        prior = round(clip(0.2 + 0.1 * (max(1, min(5, int(rating))) - 1)), 6)
        concepts = db.query(Concept).filter(Concept.topic_id == topic_id).all()
        for concept in concepts:
            record = _mastery(db, user_id, concept.id, prior)
            record.p_know = prior
            record.n_obs = 0
            record.confidence = 0.0
            record.half_life = INITIAL_HALF_LIFE
            count += 1
    db.commit()
    return {"course_id": course_id, "concepts_initialized": count, "hours_per_week": hours_per_week}


def select_diagnostic_questions(db: Session, course_id: str, limit: int = 10) -> list[Question]:
    """Choose one mid-difficulty question per top-level topic."""
    topics = db.query(Topic).filter(Topic.course_id == course_id, Topic.parent_id.is_(None)).all()
    selected: list[Question] = []
    for topic in topics:
        question = db.query(Question).join(Concept).filter(
            Concept.topic_id == topic.id
        ).order_by(func.abs(Question.difficulty - 0.5)).first()
        if question:
            selected.append(question)
    return selected[:limit]
