import random
from pathlib import Path

from evaluation.simulator import SimQuestion, SimStudent, run_experiment


def test_simulator_probabilities() -> None:
    student = SimStudent("C", ["theory"], random.Random(3))
    question = SimQuestion("q", "theory", difficulty=0.7)
    assert 0.0 <= student.probability_correct(question) <= 1.0


def test_learning_gain() -> None:
    student = SimStudent("C", ["theory"], random.Random(3))
    question = SimQuestion("q", "theory")
    before = student.hidden_mastery["theory"]
    student.learn(question, got_feedback=True)
    assert student.hidden_mastery["theory"] > before


def test_forgetting_decay() -> None:
    student = SimStudent("C", ["theory"], random.Random(3))
    before = student.hidden_mastery["theory"]
    student.forget(10)
    assert student.hidden_mastery["theory"] < before


def test_misconception_confusion() -> None:
    student = SimStudent("D", ["precision"], random.Random(11))
    question = SimQuestion(
        "q",
        "precision",
        difficulty=0.5,
        misconception_id="precision-recall",
        confusable_pair="precision-recall",
    )
    wrong = 0
    confused = 0
    for _ in range(1000):
        correct, misconception = student.answer(question)
        if not correct:
            wrong += 1
            confused += misconception == "precision-recall"
    assert confused / wrong > 0.70


def test_seeded_determinism() -> None:
    first = run_experiment(seeds=1, sessions=2, questions_per_session=4)
    second = run_experiment(seeds=1, sessions=2, questions_per_session=4)
    assert first["learning_curves"] == second["learning_curves"]


def test_adaptive_beats_random() -> None:
    result = run_experiment(seeds=3, sessions=6, questions_per_session=15)
    adaptive = result["metrics"]["adaptive"]["normalized_gain"]["mean"]
    random_gain = result["metrics"]["random"]["normalized_gain"]["mean"]
    assert adaptive > 1.5 * random_gain
