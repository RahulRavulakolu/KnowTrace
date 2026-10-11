"""Sample course tags for manual taxonomy accuracy review."""

import argparse
import random

from backend.core.db import SessionLocal
from backend.models.db import ChunkConcept, ContentChunk


def audit(course_id: str, sample_size: int = 30, annotations: str | None = None) -> None:
    """Print a CSV-friendly audit sample for spreadsheet annotation."""
    db = SessionLocal()
    try:
        chunks = db.query(ContentChunk).filter(ContentChunk.course_id == course_id).all()
        sample = random.sample(chunks, min(sample_size, len(chunks)))
        for chunk in sample:
            tags = db.query(ChunkConcept).filter(ChunkConcept.chunk_id == chunk.id).all()
            print(
                {
                    "chunk_id": str(chunk.id),
                    "text": chunk.text.replace("\n", " ")[:1000],
                    "assigned_tags": ",".join(str(tag.concept_id) for tag in tags),
                    "correct": "",
                    "notes": "Inspect text, visual context, and citation before marking correct.",
                }
            )
        if annotations:
            with open(annotations, encoding="utf-8", newline="") as handle:
                rows = list(__import__("csv").DictReader(handle))
            marked = [row for row in rows if row.get("correct", "").strip()]
            correct = [
                row for row in marked if row["correct"].strip().lower() in {"1", "true", "yes", "y"}
            ]
            accuracy = 100.0 * len(correct) / len(marked) if marked else 0.0
            print(f"tag_accuracy={accuracy:.2f}% (sample={len(marked)}; required>=90%)")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--course_id", required=True)
    parser.add_argument("--sample-size", type=int, default=30)
    parser.add_argument(
        "--annotations", help="CSV exported from the manually annotated audit spreadsheet"
    )
    args = parser.parse_args()
    audit(args.course_id, args.sample_size, args.annotations)
