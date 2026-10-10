"""Build and validate a question bank for a course."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from backend.core.db import SessionLocal
from backend.models.db import Concept, ContentChunk, Topic
from services.assessment.generate import generate_question
from services.assessment.validate import validate_question


def build_question_bank(course_id: str, per_concept: int = 10) -> dict:
    db = SessionLocal()
    questions: list[dict] = []
    rejection_stats: dict[str, int] = {}
    try:
        concepts = db.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
        types = ["mcq", "short", "numerical", "conceptual"]
        for concept in concepts:
            chunk = db.query(ContentChunk).filter(ContentChunk.course_id == course_id).first()
            if chunk is None:
                continue
            existing: list[dict] = []
            for index in range(per_concept):
                qtype = types[index % len(types)]
                difficulty = (0.3, 0.5, 0.7)[index % 3]
                draft = generate_question(concept.id, qtype, difficulty, [], db)
                result = validate_question(draft, chunk, concept, db, existing=existing)
                if result["status"] == "approved":
                    existing.append(draft)
                else:
                    reason = result["validation_report"]["rejection_reason"] or "unknown"
                    rejection_stats[reason] = rejection_stats.get(reason, 0) + 1
                questions.append({"concept_id": concept.id, "question": draft, **result})
    finally:
        db.close()
    approved = sum(item["status"] == "approved" for item in questions)
    return {
        "course_id": course_id,
        "questions": questions,
        "stats": {
            "generated": len(questions),
            "approved": approved,
            "approval_rate": approved / len(questions) if questions else 0.0,
            "rejections_by_stage": rejection_stats,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--course-id", required=True)
    parser.add_argument("--per-concept", type=int, default=10)
    args = parser.parse_args()
    result = build_question_bank(args.course_id, args.per_concept)
    output = Path("evaluation/question_bank.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    print(json.dumps(result["stats"], indent=2))


if __name__ == "__main__":
    main()
