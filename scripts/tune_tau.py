"""Sweep refusal thresholds against a benchmark JSON file."""

import argparse
import json


def metrics(rows: list[dict], tau: float) -> tuple[float, float, float]:
    """Compute precision, recall, and F1 for refusal classification."""
    predicted = [row.get("score", 0.0) < tau for row in rows]
    actual = [not row.get("answerable", False) for row in rows]
    tp = sum(p and a for p, a in zip(predicted, actual))
    fp = sum(p and not a for p, a in zip(predicted, actual))
    fn = sum(not p and a for p, a in zip(predicted, actual))
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-9)
    return precision, recall, f1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("benchmark")
    args = parser.parse_args()
    with open(args.benchmark, encoding="utf-8") as handle:
        rows = json.load(handle)
    best = max(((metrics(rows, round(index / 20, 2)), round(index / 20, 2))
                for index in range(2, 17)), key=lambda item: item[0][2])
    for index in range(2, 17):
        tau = round(index / 20, 2)
        print(tau, metrics(rows, tau))
    print(f"optimal_tau={best[1]} metrics={best[0]}")
