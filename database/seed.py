"""Seed database with demonstration courses, provenance chunks, and concepts.

Seeds 3 multi-platform showcase courses:
1. NPTEL — Machine Learning (Prof. Balaraman Ravindran, IIT Madras)
2. MIT OpenCourseWare — Mathematics for Computer Science (Prof. Tom Leighton, Prof. Marten van Dijk, MIT)
3. MITx — Introduction to Computer Science and Programming Using Python (Prof. John Guttag, MITx)
plus legacy CS 101 course for backward-compatibility with existing tests.

Run via:
    python database/seed.py
"""

import sys
from datetime import date, timedelta
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.core.db import Base, SessionLocal, engine
from backend.core.logging import logger, setup_logging
from backend.models.db import (
    Assessment,
    ChunkConcept,
    Concept,
    ContentChunk,
    Course,
    LearnerMastery,
    Misconception,
    Question,
    Source,
    StudyPlan,
    Topic,
    User,
)


def seed_database() -> None:
    """Populate database with sample courses and provenance data."""
    setup_logging()
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        # 1. Default User
        user = session.query(User).filter_by(email="student@knowtrace.ai").first()
        if not user:
            user = User(
                email="student@knowtrace.ai",
                name="Alex Learner",
            )
            session.add(user)
            session.flush()
            logger.info("Created user: %s (id=%s)", user.name, user.id)

        # =====================================================================
        # Course A: Legacy CS 101 (Algorithms & Data Structures)
        # =====================================================================
        course_cs101 = session.query(Course).filter_by(owner_id=user.id, title="CS 101: Algorithms & Data Structures").first()
        if not course_cs101:
            course_cs101 = Course(
                owner_id=user.id,
                title="CS 101: Algorithms & Data Structures",
                exam_date=date.today() + timedelta(days=60),
                hours_per_day=2.0,
                is_ingested=True,
            )
            session.add(course_cs101)
            session.flush()

        src_trees = session.query(Source).filter_by(course_id=course_cs101.id, filename="lecture_03_trees.pdf").first()
        if not src_trees:
            src_trees = Source(
                course_id=course_cs101.id,
                type="pdf",
                filename="lecture_03_trees.pdf",
                uri="uploads/lecture_03_trees.pdf",
                status="done",
                stage="embed",
                progress=1.0,
            )
            session.add(src_trees)
            session.flush()

        top_trees = session.query(Topic).filter_by(course_id=course_cs101.id, name="Trees and Search Structures").first()
        if not top_trees:
            top_trees = Topic(course_id=course_cs101.id, name="Trees and Search Structures")
            session.add(top_trees)
            session.flush()

        c_bst = session.query(Concept).filter_by(topic_id=top_trees.id, name="Binary Search Tree Property").first()
        if not c_bst:
            c_bst = Concept(
                topic_id=top_trees.id,
                name="Binary Search Tree Property",
                description="For any node, keys in the left subtree are smaller, and keys in the right subtree are larger.",
                importance=1.0,
            )
            session.add(c_bst)
            session.flush()

        chunk_bst = session.query(ContentChunk).filter_by(source_id=src_trees.id, page=5).first()
        if not chunk_bst:
            chunk_bst = ContentChunk(
                course_id=course_cs101.id,
                source_id=src_trees.id,
                modality="text",
                text="A Binary Search Tree (BST) is a node-based tree where the key in each node is greater than all keys in its left subtree and less than all keys in its right subtree.",
                page=5,
                topic_id=top_trees.id,
                difficulty=0.4,
                extraction_confidence=0.98,
                language="en",
            )
            session.add(chunk_bst)
            session.flush()

            cc = ChunkConcept(chunk_id=chunk_bst.id, concept_id=c_bst.id, relevance=1.0)
            session.add(cc)

            q_bst = Question(
                concept_id=c_bst.id,
                source_chunk_ids=[chunk_bst.id],
                question_text="What is the worst-case search time complexity in a balanced Binary Search Tree containing N elements?",
                question_type="mcq",
                options=[
                    {"key": "A", "text": "O(1)", "is_correct": False},
                    {"key": "B", "text": "O(log N)", "is_correct": True},
                    {"key": "C", "text": "O(N)", "is_correct": False},
                    {"key": "D", "text": "O(N log N)", "is_correct": False},
                ],
                correct_answer="B",
                explanation="In a balanced BST, maximum depth is O(log N), giving O(log N) worst-case search time.",
                difficulty=0.3,
                bloom_level="understand",
                status="approved",
                validated_by="groq:llama3-70b-8192",
            )
            session.add(q_bst)

            plan_cs101 = StudyPlan(
                user_id=user.id,
                course_id=course_cs101.id,
                title="Mastery in 60 Days",
                target_date=course_cs101.exam_date,
                topics_priority=[top_trees.id],
                status="active",
                progress=0.1,
            )
            session.add(plan_cs101)

        # =====================================================================
        # Course 1: NPTEL — Machine Learning (Prof. Balaraman Ravindran, IIT Madras)
        # =====================================================================
        course_nptel = session.query(Course).filter_by(source_platform="nptel", source_id="nptel-ml-106106139").first()
        if not course_nptel:
            course_nptel = Course(
                owner_id=user.id,
                title="Machine Learning",
                source_platform="nptel",
                source_id="nptel-ml-106106139",
                source_url="https://nptel.ac.in/courses/106106139",
                access_type="free",
                instructor="Prof. Balaraman Ravindran",
                institution="IIT Madras",
                category="Computer Science & Engineering",
                language="English",
                duration="12 weeks",
                certificate_available=True,
                is_ingested=True,
                description="Comprehensive machine learning course covering supervised learning, learning theory, regularization, and classification.",
                exam_date=date.today() + timedelta(days=45),
                hours_per_day=2.0,
            )
            session.add(course_nptel)
            session.flush()
            logger.info("Created NPTEL course: id=%s", course_nptel.id)

        src_nptel_pdf = session.query(Source).filter_by(course_id=course_nptel.id, filename="Lecture_04_Regularization.pdf").first()
        if not src_nptel_pdf:
            src_nptel_pdf = Source(
                course_id=course_nptel.id,
                type="pdf",
                filename="Lecture_04_Regularization.pdf",
                uri="uploads/Lecture_04_Regularization.pdf",
                status="done",
                stage="embed",
                progress=1.0,
            )
            session.add(src_nptel_pdf)
            session.flush()

        src_nptel_vid = session.query(Source).filter_by(course_id=course_nptel.id, filename="Lecture_05_Model_Evaluation.mp4").first()
        if not src_nptel_vid:
            src_nptel_vid = Source(
                course_id=course_nptel.id,
                type="video",
                filename="Lecture_05_Model_Evaluation.mp4",
                uri="uploads/Lecture_05_Model_Evaluation.mp4",
                status="done",
                stage="embed",
                progress=1.0,
            )
            session.add(src_nptel_vid)
            session.flush()

        top_reg = session.query(Topic).filter_by(course_id=course_nptel.id, name="Regularization & Model Selection").first()
        if not top_reg:
            top_reg = Topic(course_id=course_nptel.id, name="Regularization & Model Selection")
            session.add(top_reg)
            session.flush()

        c_l1_l2 = session.query(Concept).filter_by(topic_id=top_reg.id, name="L1 vs L2 Regularization").first()
        if not c_l1_l2:
            c_l1_l2 = Concept(
                topic_id=top_reg.id,
                name="L1 vs L2 Regularization",
                description="L1 (Lasso) penalty constraint forms a diamond in 2D with sharp vertices causing exact sparsity. L2 (Ridge) penalty is a hypersphere that smoothly shrinks weights.",
                importance=1.0,
            )
            session.add(c_l1_l2)
            session.flush()

        c_pr = session.query(Concept).filter_by(topic_id=top_reg.id, name="Precision vs Recall Trade-off").first()
        if not c_pr:
            c_pr = Concept(
                topic_id=top_reg.id,
                name="Precision vs Recall Trade-off",
                description="Raising decision threshold decreases false positives (higher precision) but increases false negatives (lower recall).",
                importance=0.9,
            )
            session.add(c_pr)
            session.flush()

        chunk_l1 = session.query(ContentChunk).filter_by(source_id=src_nptel_pdf.id, page=42).first()
        if not chunk_l1:
            chunk_l1 = ContentChunk(
                course_id=course_nptel.id,
                source_id=src_nptel_pdf.id,
                modality="text",
                text="When p=1 (Lasso), the penalty constraint forms a diamond in 2D with sharp corners along coordinate axes. Loss contours make first contact at a vertex where w_i = 0, inducing true parameter sparsity.",
                page=42,
                topic_id=top_reg.id,
                difficulty=0.5,
                extraction_confidence=0.99,
                language="en",
            )
            session.add(chunk_l1)
            session.flush()
            session.add(ChunkConcept(chunk_id=chunk_l1.id, concept_id=c_l1_l2.id, relevance=1.0))

        chunk_pr = session.query(ContentChunk).filter_by(source_id=src_nptel_vid.id, ts_start=1112.0).first()
        if not chunk_pr:
            chunk_pr = ContentChunk(
                course_id=course_nptel.id,
                source_id=src_nptel_vid.id,
                modality="video",
                text="Why does precision change inversely with recall? When you raise the threshold, you only classify items you are overwhelmingly confident in as positive. This drives down false positives, boosting precision. But you miss borderline real positives, dropping recall.",
                ts_start=1112.0,
                ts_end=1145.0,
                topic_id=top_reg.id,
                difficulty=0.4,
                extraction_confidence=0.96,
                language="en",
            )
            session.add(chunk_pr)
            session.flush()
            session.add(ChunkConcept(chunk_id=chunk_pr.id, concept_id=c_pr.id, relevance=1.0))

        q_l1 = session.query(Question).filter_by(concept_id=c_l1_l2.id).first()
        if not q_l1:
            q_l1 = Question(
                concept_id=c_l1_l2.id,
                source_chunk_ids=[chunk_l1.id],
                question_text="Why does L1 regularization (Lasso) induce exact sparsity in feature weights, whereas L2 regularization (Ridge) does not?",
                question_type="mcq",
                options=[
                    {"key": "A", "text": "L1 norm has a higher derivative than L2 norm everywhere", "is_correct": False},
                    {"key": "B", "text": "The L1 constraint boundary is a polytope whose sharp vertices touch loss contours at coordinates where w_i = 0", "is_correct": True},
                    {"key": "C", "text": "L1 regularization forces the Hessian matrix eigenvalues to be strictly negative", "is_correct": False},
                    {"key": "D", "text": "L2 regularization is mathematically incompatible with convex loss functions", "is_correct": False},
                ],
                correct_answer="B",
                explanation="In 2D or higher, the L1 constraint region is diamond-shaped with corners lying on the coordinate axes. Expanding loss contours typically touch these sharp vertices first, driving coordinates directly to zero.",
                difficulty=0.5,
                bloom_level="analyze",
                status="approved",
                validated_by="groq:llama3-70b-8192",
            )
            session.add(q_l1)

        q_pr = session.query(Question).filter_by(concept_id=c_pr.id).first()
        if not q_pr:
            q_pr = Question(
                concept_id=c_pr.id,
                source_chunk_ids=[chunk_pr.id],
                question_text="In binary classification, what happens to Precision and Recall when you increase the decision threshold from 0.5 to 0.85?",
                question_type="mcq",
                options=[
                    {"key": "A", "text": "Precision increases, Recall decreases", "is_correct": True},
                    {"key": "B", "text": "Precision decreases, Recall increases", "is_correct": False},
                    {"key": "C", "text": "Both Precision and Recall increase simultaneously", "is_correct": False},
                    {"key": "D", "text": "Neither metric changes because model parameters are frozen", "is_correct": False},
                ],
                correct_answer="A",
                explanation="A stricter threshold classifies fewer samples as positive, eliminating borderline false alarms (fewer false positives -> higher precision) at the expense of missing genuine positive cases (more false negatives -> lower recall).",
                difficulty=0.3,
                bloom_level="apply",
                status="approved",
                validated_by="groq:llama3-70b-8192",
            )
            session.add(q_pr)

        plan_nptel = session.query(StudyPlan).filter_by(user_id=user.id, course_id=course_nptel.id).first()
        if not plan_nptel:
            plan_nptel = StudyPlan(
                user_id=user.id,
                course_id=course_nptel.id,
                title="NPTEL Machine Learning Study Plan",
                target_date=course_nptel.exam_date,
                topics_priority=[top_reg.id],
                status="active",
                progress=0.35,
            )
            session.add(plan_nptel)

        # =====================================================================
        # Course 2: MIT OpenCourseWare — Mathematics for Computer Science
        # =====================================================================
        course_mit = session.query(Course).filter_by(source_platform="mit_ocw", source_id="mit-ocw-6-042j").first()
        if not course_mit:
            course_mit = Course(
                owner_id=user.id,
                title="Mathematics for Computer Science",
                source_platform="mit_ocw",
                source_id="mit-ocw-6-042j",
                source_url="https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/",
                access_type="free",
                instructor="Prof. Tom Leighton, Prof. Marten van Dijk",
                institution="MIT",
                category="Mathematics",
                language="English",
                duration="Self-paced",
                certificate_available=False,
                is_ingested=True,
                description="Discrete mathematics for computer science: formal proofs, induction, graph theory, counting, and probability.",
                exam_date=date.today() + timedelta(days=60),
                hours_per_day=2.0,
            )
            session.add(course_mit)
            session.flush()
            logger.info("Created MIT OCW course: id=%s", course_mit.id)

        src_mit_pdf = session.query(Source).filter_by(course_id=course_mit.id, filename="Unit_01_Proofs_and_Induction.pdf").first()
        if not src_mit_pdf:
            src_mit_pdf = Source(
                course_id=course_mit.id,
                type="pdf",
                filename="Unit_01_Proofs_and_Induction.pdf",
                uri="uploads/Unit_01_Proofs_and_Induction.pdf",
                status="done",
                stage="embed",
                progress=1.0,
            )
            session.add(src_mit_pdf)
            session.flush()

        top_proofs = session.query(Topic).filter_by(course_id=course_mit.id, name="Formal Proofs & Well Ordering").first()
        if not top_proofs:
            top_proofs = Topic(course_id=course_mit.id, name="Formal Proofs & Well Ordering")
            session.add(top_proofs)
            session.flush()

        c_wop = session.query(Concept).filter_by(topic_id=top_proofs.id, name="Well Ordering Principle").first()
        if not c_wop:
            c_wop = Concept(
                topic_id=top_proofs.id,
                name="Well Ordering Principle",
                description="Every non-empty set of non-negative integers contains a minimum element. Forms a fundamental proof mechanism via minimum counterexamples.",
                importance=1.0,
            )
            session.add(c_wop)
            session.flush()

        chunk_wop = session.query(ContentChunk).filter_by(source_id=src_mit_pdf.id, page=8).first()
        if not chunk_wop:
            chunk_wop = ContentChunk(
                course_id=course_mit.id,
                source_id=src_mit_pdf.id,
                modality="text",
                text="The Well Ordering Principle states that every non-empty set of non-negative integers has a minimum element. It provides an alternative proof technique to induction for proving statements by contradiction on minimal counterexamples.",
                page=8,
                topic_id=top_proofs.id,
                difficulty=0.4,
                extraction_confidence=0.98,
                language="en",
            )
            session.add(chunk_wop)
            session.flush()
            session.add(ChunkConcept(chunk_id=chunk_wop.id, concept_id=c_wop.id, relevance=1.0))

        q_wop = session.query(Question).filter_by(concept_id=c_wop.id).first()
        if not q_wop:
            q_wop = Question(
                concept_id=c_wop.id,
                source_chunk_ids=[chunk_wop.id],
                question_text="Under what conditions does the Well Ordering Principle guarantee the existence of a smallest element?",
                question_type="mcq",
                options=[
                    {"key": "A", "text": "Any bounded set of real numbers", "is_correct": False},
                    {"key": "B", "text": "Any non-empty set of non-negative integers", "is_correct": True},
                    {"key": "C", "text": "Any non-empty set of integers that contains zero", "is_correct": False},
                    {"key": "D", "text": "Any continuous interval [a, b]", "is_correct": False},
                ],
                correct_answer="B",
                explanation="The Well Ordering Principle applies specifically to non-empty subsets of non-negative integers (or integers bounded below). It does not hold for negative integers without a lower bound, or for real numbers.",
                difficulty=0.3,
                bloom_level="understand",
                status="approved",
                validated_by="groq:llama3-70b-8192",
            )
            session.add(q_wop)

        plan_mit = session.query(StudyPlan).filter_by(user_id=user.id, course_id=course_mit.id).first()
        if not plan_mit:
            plan_mit = StudyPlan(
                user_id=user.id,
                course_id=course_mit.id,
                title="Discrete Mathematics Study Plan",
                target_date=course_mit.exam_date,
                topics_priority=[top_proofs.id],
                status="active",
                progress=0.2,
            )
            session.add(plan_mit)

        # =====================================================================
        # Course 3: MITx — Introduction to Computer Science and Programming Using Python
        # =====================================================================
        course_mitx = session.query(Course).filter_by(source_platform="mitx", source_id="mitx-6-00-1x").first()
        if not course_mitx:
            course_mitx = Course(
                owner_id=user.id,
                title="Introduction to Computer Science and Programming Using Python",
                source_platform="mitx",
                source_id="mitx-6-00-1x",
                source_url="https://www.edx.org/course/introduction-to-computer-science-and-programming-7",
                access_type="free_paid_cert",
                instructor="Prof. John Guttag",
                institution="MITx",
                category="Computer Science",
                language="English",
                duration="9 weeks",
                certificate_available=True,
                is_ingested=True,
                description="Computational thinking, algorithms, testing, and algorithmic complexity using Python 3.",
                exam_date=date.today() + timedelta(days=50),
                hours_per_day=2.0,
            )
            session.add(course_mitx)
            session.flush()
            logger.info("Created MITx course: id=%s", course_mitx.id)

        src_mitx_pdf = session.query(Source).filter_by(course_id=course_mitx.id, filename="Unit_02_Recursion_and_Dictionaries.pdf").first()
        if not src_mitx_pdf:
            src_mitx_pdf = Source(
                course_id=course_mitx.id,
                type="pdf",
                filename="Unit_02_Recursion_and_Dictionaries.pdf",
                uri="uploads/Unit_02_Recursion_and_Dictionaries.pdf",
                status="done",
                stage="embed",
                progress=1.0,
            )
            session.add(src_mitx_pdf)
            session.flush()

        top_recursion = session.query(Topic).filter_by(course_id=course_mitx.id, name="Recursion & Dictionaries").first()
        if not top_recursion:
            top_recursion = Topic(course_id=course_mitx.id, name="Recursion & Dictionaries")
            session.add(top_recursion)
            session.flush()

        c_rec = session.query(Concept).filter_by(topic_id=top_recursion.id, name="Recursion Base Case Design").first()
        if not c_rec:
            c_rec = Concept(
                topic_id=top_recursion.id,
                name="Recursion Base Case Design",
                description="A recursive function must have at least one base case that returns without recursion, avoiding infinite call stack growth.",
                importance=1.0,
            )
            session.add(c_rec)
            session.flush()

        chunk_rec = session.query(ContentChunk).filter_by(source_id=src_mitx_pdf.id, page=18).first()
        if not chunk_rec:
            chunk_rec = ContentChunk(
                course_id=course_mitx.id,
                source_id=src_mitx_pdf.id,
                modality="text",
                text="A recursive function must possess at least one base case that terminates the recursion without further self-calls. Each recursive call places a new stack frame on the call stack until the base case returns.",
                page=18,
                topic_id=top_recursion.id,
                difficulty=0.3,
                extraction_confidence=0.98,
                language="en",
            )
            session.add(chunk_rec)
            session.flush()
            session.add(ChunkConcept(chunk_id=chunk_rec.id, concept_id=c_rec.id, relevance=1.0))

        q_rec = session.query(Question).filter_by(concept_id=c_rec.id).first()
        if not q_rec:
            q_rec = Question(
                concept_id=c_rec.id,
                source_chunk_ids=[chunk_rec.id],
                question_text="What happens in Python when a recursive function fails to hit its base case?",
                question_type="mcq",
                options=[
                    {"key": "A", "text": "It raises a RecursionError after exceeding maximum recursion depth", "is_correct": True},
                    {"key": "B", "text": "It returns None automatically", "is_correct": False},
                    {"key": "C", "text": "The Python interpreter allocates disk swap space to continue executing", "is_correct": False},
                    {"key": "D", "text": "The function converts silently to a while loop", "is_correct": False},
                ],
                correct_answer="A",
                explanation="Without hitting a base case, recursion continues adding stack frames until Python reaches sys.getrecursionlimit(), raising RecursionError (maximum recursion depth exceeded).",
                difficulty=0.2,
                bloom_level="understand",
                status="approved",
                validated_by="groq:llama3-70b-8192",
            )
            session.add(q_rec)

        plan_mitx = session.query(StudyPlan).filter_by(user_id=user.id, course_id=course_mitx.id).first()
        if not plan_mitx:
            plan_mitx = StudyPlan(
                user_id=user.id,
                course_id=course_mitx.id,
                title="Python Programming Mastery Plan",
                target_date=course_mitx.exam_date,
                topics_priority=[top_recursion.id],
                status="active",
                progress=0.4,
            )
            session.add(plan_mitx)

        session.commit()
        logger.info("Database seeding completed successfully for all 3 demonstration courses + CS 101.")
    except Exception as exc:
        session.rollback()
        logger.error("Database seeding failed: %s", exc, exc_info=True)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
