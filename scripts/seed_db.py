"""Database Seed Script for KnowTrace Development Environment.

Creates initial sample data demonstrating the 15-table relational schema:
- A Course ("Introduction to Machine Learning")
- Topics ("Supervised Learning", "Optimization")
- Concepts ("Gradient Descent", "Loss Functions")
- Prerequisite Graph edge ("Loss Functions" -> "Gradient Descent")
- Source Document ("CS229 Lecture Notes.pdf")
- ContentChunk with complete Provenance Spine (source_id, page_number=14, bbox)
- Approved Question anchored to the chunk
- Learner & Initial Mastery record
"""

import os
import sys
import uuid

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.core.database import SessionLocal, Base, engine
from database.models import (
    User,
    Course,
    Topic,
    Concept,
    Prerequisite,
    Source,
    ContentChunk,
    ChunkConcept,
    Question,
    LearnerMastery,
    Assessment,
)


def seed_database():
    """Populate database with baseline demonstration records."""
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        # Check if already seeded
        existing_course = session.query(Course).filter_by(code="CS229").first()
        if existing_course:
            print("Database already seeded with CS229. Skipping.")
            return

        print("Seeding demo course, topics, concepts, and provenance spine chunks...")

        # 1. User (Student)
        student = User(
            id=str(uuid.uuid4()),
            email="learner@knowtrace.edu",
            name="Alex Student",
            role="student",
        )
        session.add(student)

        # 2. Course
        course = Course(
            id=str(uuid.uuid4()),
            title="Introduction to Machine Learning",
            code="CS229",
            description="Foundational principles of statistical learning, optimization, and neural architectures.",
        )
        session.add(course)
        session.flush()

        # 3. Topics
        topic_opt = Topic(
            id=str(uuid.uuid4()),
            course_id=course.id,
            title="Mathematical Optimization",
            description="Gradient-based optimization methods in high-dimensional spaces.",
            order_index=1,
        )
        session.add(topic_opt)
        session.flush()

        # 4. Concepts
        concept_loss = Concept(
            id=str(uuid.uuid4()),
            topic_id=topic_opt.id,
            name="Loss Functions",
            description="Mathematical formulations measuring model discrepancy (e.g. Mean Squared Error, Cross Entropy).",
            difficulty=0.3,
        )
        concept_gd = Concept(
            id=str(uuid.uuid4()),
            topic_id=topic_opt.id,
            name="Gradient Descent",
            description="First-order iterative optimization algorithm for finding a local minimum of a differentiable function.",
            difficulty=0.5,
        )
        session.add_all([concept_loss, concept_gd])
        session.flush()

        # 5. Prerequisite: Loss Functions is strict prerequisite for Gradient Descent
        prereq = Prerequisite(
            id=str(uuid.uuid4()),
            concept_id=concept_gd.id,
            prerequisite_concept_id=concept_loss.id,
            relationship_type="strict",
            weight=1.0,
        )
        session.add(prereq)

        # 6. Source
        source = Source(
            id=str(uuid.uuid4()),
            course_id=course.id,
            title="Lecture Notes: Gradient-Based Optimization",
            source_type="pdf",
            file_path="uploads/cs229_optimization.pdf",
            status="processed",
            metadata_json={"page_count": 28, "sha256": "abcdef1234567890"},
        )
        session.add(source)
        session.flush()

        # 7. Content Chunk (The Provenance Spine: Rule 1)
        chunk = ContentChunk(
            id=str(uuid.uuid4()),
            source_id=source.id,
            chunk_type="text",
            content=(
                "Gradient descent updates parameter vector theta iteratively by moving in the direction "
                "of steepest descent: theta := theta - alpha * grad(J(theta)), where alpha is the learning rate."
            ),
            page_number=14,
            slide_number=None,
            ts_start=None,
            ts_end=None,
            bbox={"x0": 54.0, "y0": 120.5, "x1": 550.0, "y1": 180.0},
            metadata_json={"section": "3.1 Batch Gradient Descent"},
        )
        session.add(chunk)
        session.flush()

        # 8. Chunk-Concept Association
        assoc = ChunkConcept(
            chunk_id=chunk.id,
            concept_id=concept_gd.id,
            relevance_score=0.98,
        )
        session.add(assoc)

        # 9. Validated Question (Rule 6: status='approved')
        question = Question(
            id=str(uuid.uuid4()),
            concept_id=concept_gd.id,
            source_chunk_ids=[chunk.id],
            question_text="In standard gradient descent, what role does the parameter alpha play in the update rule theta := theta - alpha * grad(J(theta))?",
            question_type="multiple_choice",
            options=[
                {"key": "A", "text": "It defines the learning rate, controlling step size along the negative gradient."},
                {"key": "B", "text": "It represents the momentum coefficient accelerating velocity."},
                {"key": "C", "text": "It normalizes the feature matrix to zero mean."},
                {"key": "D", "text": "It is the regularization penalty shrinking weights."},
            ],
            correct_answer="A",
            explanation="As stated in Section 3.1 (Page 14), alpha denotes the learning rate scaling the gradient vector.",
            difficulty=0.4,
            status="approved",  # Rule 6
            validated_by="Groq-Llama3-70b",
            validation_notes="Verified against chunk page 14: mathematically precise and unambiguous.",
        )
        session.add(question)

        # 10. Initial Learner Mastery
        mastery = LearnerMastery(
            id=str(uuid.uuid4()),
            user_id=student.id,
            concept_id=concept_gd.id,
            p_know=0.72,
            confidence=0.85,
            history=[{"attempt_id": "seed-1", "is_correct": True}],
        )
        session.add(mastery)

        session.commit()
        print("Successfully seeded KnowTrace database with sample entities!")
    except Exception as exc:
        session.rollback()
        print(f"Error seeding database: {exc}")
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
