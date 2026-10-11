"""Unit and integration tests for all 15 database models and the Provenance Spine."""

import uuid

from sqlalchemy.orm import Session

from backend.models.db import (
    Assessment,
    Attempt,
    ChatTurn,
    ChunkConcept,
    Concept,
    ContentChunk,
    Course,
    LearnerMastery,
    Misconception,
    Prerequisite,
    Question,
    Source,
    StudyPlan,
    Topic,
    User,
)


def test_provenance_spine_content_chunk(db_session: Session):
    """Rule 1: Provenance spine: every chunk stores source_id + page|slide|ts_start/ts_end (+ bbox for figures)."""
    # 1. Course & Source
    course = Course(title="Data Structures", code="CS102")
    db_session.add(course)
    db_session.flush()

    source = Source(
        course_id=course.id,
        filename="algo.pdf",
        type="pdf",
        uri="uploads/algo.pdf",
    )
    db_session.add(source)
    db_session.flush()

    # 2. Text Chunk with PDF Page and BBox
    pdf_chunk = ContentChunk(
        course_id=course.id,
        source_id=source.id,
        modality="figure",
        text="Binary Search Tree balance rotation figure.",
        page=42,
        slide=None,
        ts_start=None,
        ts_end=None,
        bbox=[10.0, 20.0, 200.0, 150.0],
    )
    db_session.add(pdf_chunk)

    # 3. Video Transcript Chunk with ts_start and ts_end
    video_source = Source(
        course_id=course.id,
        filename="lec4.mp4",
        type="video",
        uri="uploads/lec4.mp4",
    )
    db_session.add(video_source)
    db_session.flush()

    video_chunk = ContentChunk(
        course_id=course.id,
        source_id=video_source.id,
        modality="transcript",
        text="Now let's examine AVL tree rotations in detail.",
        page=None,
        slide=None,
        ts_start=124.5,
        ts_end=158.0,
    )
    db_session.add(video_chunk)

    # 4. Slide Chunk with slide number
    slides_source = Source(
        course_id=course.id,
        filename="deck5.pptx",
        type="slides",
        uri="uploads/deck5.pptx",
    )
    db_session.add(slides_source)
    db_session.flush()

    slide_chunk = ContentChunk(
        course_id=course.id,
        source_id=slides_source.id,
        modality="slide_text",
        text="Worst-case time complexity of BST operations.",
        page=None,
        slide=7,
        ts_start=None,
        ts_end=None,
    )
    db_session.add(slide_chunk)
    db_session.commit()

    # Query and verify provenance spine fields
    queried_pdf = db_session.query(ContentChunk).filter_by(id=pdf_chunk.id).first()
    assert queried_pdf is not None
    assert queried_pdf.page == 42
    assert queried_pdf.bbox[0] == 10.0

    queried_vid = db_session.query(ContentChunk).filter_by(id=video_chunk.id).first()
    assert queried_vid is not None
    assert queried_vid.ts_start == 124.5
    assert queried_vid.ts_end == 158.0

    queried_slide = db_session.query(ContentChunk).filter_by(id=slide_chunk.id).first()
    assert queried_slide is not None
    assert queried_slide.slide == 7


def test_question_status_pipeline(db_session: Session):
    """Rule 6: Only validated questions (status='approved') served to students."""
    course = Course(title="Physics I", code="PHYS101")
    db_session.add(course)
    db_session.flush()

    topic = Topic(course_id=course.id, name="Kinematics")
    db_session.add(topic)
    db_session.flush()

    concept = Concept(topic_id=topic.id, name="Uniform Acceleration")
    db_session.add(concept)
    db_session.flush()

    # Draft question
    draft_q = Question(
        concept_id=concept.id,
        question_text="What is the derivative of position with respect to time?",
        question_type="short_answer",
        correct_answer="Velocity",
        explanation="v = dx/dt",
        status="draft",
    )
    # Approved question
    approved_q = Question(
        concept_id=concept.id,
        question_text="If acceleration is zero, what is velocity?",
        question_type="short_answer",
        correct_answer="Constant",
        explanation="a = dv/dt = 0 implies v is constant.",
        status="approved",
        validated_by="Groq-Validator",
    )
    db_session.add_all([draft_q, approved_q])
    db_session.commit()

    # Student served query filters by status='approved'
    student_viewable = db_session.query(Question).filter_by(status="approved").all()
    assert len(student_viewable) == 1
    assert student_viewable[0].id == approved_q.id


def test_chat_turn_refusal_and_outside_knowledge_flags(db_session: Session):
    """Rule 5: Unsupported queries -> refuse; outside knowledge -> labeled distinctly."""
    user = User(email="test@edu.com", name="Test User")
    course = Course(title="Chemistry", code="CHEM101")
    db_session.add_all([user, course])
    db_session.flush()

    # Turn with refusal
    refused_turn = ChatTurn(
        user_id=user.id,
        course_id=course.id,
        session_id=str(uuid.uuid4()),
        role="assistant",
        content="Not found in your course material. No chapters discuss quantum electrodynamics.",
        refusal=True,
        outside_knowledge=False,
    )
    # Turn with outside knowledge
    outside_turn = ChatTurn(
        user_id=user.id,
        course_id=course.id,
        session_id=str(uuid.uuid4()),
        role="assistant",
        content="[OUTSIDE KNOWLEDGE] In general chemistry literature, Avogadro's constant is defined as...",
        refusal=False,
        outside_knowledge=True,
    )
    db_session.add_all([refused_turn, outside_turn])
    db_session.commit()

    assert refused_turn.refusal is True
    assert outside_turn.outside_knowledge is True


def test_all_15_entities_integration(db_session: Session):
    """Verify end-to-end relational schema integrity across all 15 tables."""
    # 1. User
    user = User(email="student1@test.com", name="Student One")
    # 2. Course
    course = Course(title="Biology", code="BIO101")
    db_session.add_all([user, course])
    db_session.flush()

    # 3. Source
    source = Source(course_id=course.id, filename="cell.pdf", type="pdf", uri="cell.pdf")
    db_session.add(source)
    db_session.flush()

    # 4. Topic
    topic = Topic(course_id=course.id, name="Cell Division")
    db_session.add(topic)
    db_session.flush()

    # 5. Concepts
    c1 = Concept(topic_id=topic.id, name="Mitosis", importance=0.4)
    c2 = Concept(topic_id=topic.id, name="Cytokinesis", importance=0.5)
    db_session.add_all([c1, c2])
    db_session.flush()

    # 6. ContentChunk
    chunk = ContentChunk(
        course_id=course.id,
        source_id=source.id,
        modality="text",
        text="Mitosis divides chromosomes.",
        page=5,
    )
    db_session.add(chunk)
    db_session.flush()

    # 7. ChunkConcept
    chunk_concept = ChunkConcept(chunk_id=chunk.id, concept_id=c1.id, relevance=0.95)
    db_session.add(chunk_concept)

    # 8. Prerequisite
    prereq = Prerequisite(concept_id=c2.id, prerequisite_id=c1.id, kind="strict")
    db_session.add(prereq)

    # 9. Question
    q = Question(
        concept_id=c1.id,
        question_text="What phase precedes metaphase?",
        question_type="multiple_choice",
        correct_answer="Prophase",
        explanation="Prophase is first.",
        status="approved",
    )
    db_session.add(q)
    db_session.flush()

    # 10. Assessment
    assessment = Assessment(course_id=course.id, user_id=user.id, title="Mitosis Quiz")
    db_session.add(assessment)
    db_session.flush()

    # 11. Attempt
    attempt = Attempt(
        assessment_id=assessment.id,
        user_id=user.id,
        question_id=q.id,
        user_answer="Prophase",
        is_correct=True,
        score=1.0,
    )
    db_session.add(attempt)

    # 12. LearnerMastery
    mastery = LearnerMastery(user_id=user.id, concept_id=c1.id, p_know=0.88, confidence=0.9)
    db_session.add(mastery)

    # 13. Misconception
    misconception = Misconception(
        concept_id=c1.id,
        user_id=user.id,
        label="Confusing Anaphase with Telophase",
        description="Learner inverted chromatid separation direction.",
    )
    db_session.add(misconception)

    # 14. ChatTurn
    chat_turn = ChatTurn(
        user_id=user.id,
        course_id=course.id,
        session_id=str(uuid.uuid4()),
        role="user",
        content="Explain the spindle fibers.",
    )
    db_session.add(chat_turn)

    # 15. StudyPlan
    study_plan = StudyPlan(
        user_id=user.id, course_id=course.id, title="Pre-Exam Review", progress=0.25
    )
    db_session.add(study_plan)

    db_session.commit()

    # Validate that all 15 models exist and are queryable
    assert db_session.query(User).count() >= 1
    assert db_session.query(Course).count() >= 1
    assert db_session.query(Source).count() >= 1
    assert db_session.query(Topic).count() >= 1
    assert db_session.query(Concept).count() >= 2
    assert db_session.query(ContentChunk).count() >= 1
    assert db_session.query(ChunkConcept).count() >= 1
    assert db_session.query(Prerequisite).count() >= 1
    assert db_session.query(Question).count() >= 1
    assert db_session.query(Assessment).count() >= 1
    assert db_session.query(Attempt).count() >= 1
    assert db_session.query(LearnerMastery).count() >= 1
    assert db_session.query(Misconception).count() >= 1
    assert db_session.query(ChatTurn).count() >= 1
    assert db_session.query(StudyPlan).count() >= 1
