"""Seed script to ensure all courses have rich connected DAGs, prerequisites, and realistic Bayesian mastery."""

import datetime
import sqlite3
import uuid


def seed_rich_graph():
    conn = sqlite3.connect("knowtrace.db")
    c = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    courses = c.execute("SELECT id, title FROM courses").fetchall()
    print(f"Populating rich DAG graph for {len(courses)} courses...")

    concept_defs = [
        (
            "Gradient Descent & Optimization",
            "First-order iterative optimization algorithms including batch GD, SGD, and momentum-based optimizers.",
            1.0,
            0.78,
        ),
        (
            "Bias-Variance Tradeoff",
            "Decomposition of expected prediction error into model bias, model variance, and irreducible noise.",
            1.0,
            0.54,
        ),
        (
            "Overfitting & Underfitting",
            "Recognizing high variance vs high bias symptoms in training and validation loss curves.",
            0.9,
            0.74,
        ),
        (
            "L1 vs L2 Regularization",
            "Lasso diamond sparsity vs Ridge spherical weight decay for shrinkage.",
            1.0,
            0.42,
        ),
        (
            "Cross Validation Strategies",
            "K-fold and stratified resampling strategies for unbiased generalization estimates.",
            0.8,
            0.61,
        ),
        (
            "Confusion Matrix & Metrics",
            "Tabular representation of classification outcomes: TP, FP, TN, FN.",
            0.9,
            0.82,
        ),
        (
            "Precision vs Recall Tradeoff",
            "Inverse trade-off controlled by classification decision threshold.",
            1.0,
            0.58,
        ),
        (
            "ROC & AUC Curves",
            "Receiver Operating Characteristic plotting TPR vs FPR across all decision thresholds.",
            0.9,
            0.49,
        ),
    ]

    for cid, title in courses:
        topics = c.execute("SELECT id FROM topics WHERE course_id=?", (cid,)).fetchall()
        if not topics:
            tid = str(uuid.uuid4())
            c.execute(
                "INSERT INTO topics (id, course_id, name, created_at) VALUES (?, ?, ?, ?)",
                (tid, cid, "Core Curriculum & Methods", now),
            )
            topics = [(tid,)]
        topic_id = topics[0][0]

        existing_concepts = c.execute(
            "SELECT id, name FROM concepts WHERE topic_id=?", (topic_id,)
        ).fetchall()
        existing_names = {row[1] for row in existing_concepts}
        concept_id_map = {row[1]: row[0] for row in existing_concepts}

        for name, desc, imp, mastery in concept_defs:
            if name not in existing_names:
                cid_new = str(uuid.uuid4())
                c.execute(
                    "INSERT INTO concepts (id, topic_id, name, description, importance, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (cid_new, topic_id, name, desc, imp, now),
                )
                concept_id_map[name] = cid_new
                mid = str(uuid.uuid4())
                c.execute(
                    "INSERT INTO learner_mastery (id, user_id, concept_id, p_know, confidence, n_obs, half_life, history, updated_at) VALUES (?, ?, ?, ?, 0.85, 3, 3.0, ?, ?)",
                    (mid, "student-dev-uuid", cid_new, mastery, "[]", now),
                )
            else:
                cid_curr = concept_id_map[name]
                exists = c.execute(
                    "SELECT id FROM learner_mastery WHERE concept_id=?", (cid_curr,)
                ).fetchone()
                if not exists:
                    mid = str(uuid.uuid4())
                    c.execute(
                        "INSERT INTO learner_mastery (id, user_id, concept_id, p_know, confidence, n_obs, half_life, history, updated_at) VALUES (?, ?, ?, ?, 0.85, 3, 3.0, ?, ?)",
                        (mid, "student-dev-uuid", cid_curr, mastery, "[]", now),
                    )

        prereq_pairs = [
            ("Bias-Variance Tradeoff", "Overfitting & Underfitting"),
            ("Overfitting & Underfitting", "L1 vs L2 Regularization"),
            ("Gradient Descent & Optimization", "L1 vs L2 Regularization"),
            ("Bias-Variance Tradeoff", "Cross Validation Strategies"),
            ("Confusion Matrix & Metrics", "Precision vs Recall Tradeoff"),
            ("Precision vs Recall Tradeoff", "ROC & AUC Curves"),
        ]
        for p_src, p_tgt in prereq_pairs:
            if p_src in concept_id_map and p_tgt in concept_id_map:
                src_id = concept_id_map[p_src]
                tgt_id = concept_id_map[p_tgt]
                exists = c.execute(
                    "SELECT id FROM prerequisites WHERE concept_id=? AND prerequisite_id=?",
                    (tgt_id, src_id),
                ).fetchone()
                if not exists:
                    c.execute(
                        "INSERT INTO prerequisites (id, concept_id, prerequisite_id, weight, kind, confidence, rationale) VALUES (?, ?, ?, 1.0, ?, ?, ?)",
                        (
                            str(uuid.uuid4()),
                            tgt_id,
                            src_id,
                            "requires",
                            0.95,
                            "Core foundational prerequisite",
                        ),
                    )

        if (
            "L1 vs L2 Regularization" in concept_id_map
            and "Precision vs Recall Tradeoff" in concept_id_map
        ):
            c1 = concept_id_map["L1 vs L2 Regularization"]
            c2 = concept_id_map["Precision vs Recall Tradeoff"]
            exists = c.execute(
                "SELECT id FROM misconceptions WHERE concept_a=? AND concept_b=?", (c1, c2)
            ).fetchone()
            if not exists:
                c.execute(
                    "INSERT INTO misconceptions (id, concept_id, course_id, concept_a, concept_b, wrong_answer_patterns, label, description, status, detected_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        str(uuid.uuid4()),
                        c1,
                        cid,
                        c1,
                        c2,
                        "[]",
                        "Penalty vs Metric Confusion",
                        "Confusing regularization penalties with metric thresholds",
                        "active",
                        now,
                    ),
                )

    conn.commit()
    print("Prerequisites count:", c.execute("SELECT count(*) FROM prerequisites").fetchone()[0])
    print("Concepts count:", c.execute("SELECT count(*) FROM concepts").fetchone()[0])
    print("Mastery records count:", c.execute("SELECT count(*) FROM learner_mastery").fetchone()[0])
    print("Misconceptions count:", c.execute("SELECT count(*) FROM misconceptions").fetchone()[0])
    conn.close()


if __name__ == "__main__":
    seed_rich_graph()
