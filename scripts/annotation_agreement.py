"""Compute Cohen's kappa for two independent benchmark annotations."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


def kappa(labels_a: list[str], labels_b: list[str]) -> float:
    if len(labels_a) != len(labels_b) or not labels_a:
        raise ValueError("Annotation lists must be non-empty and equal length")
    observed = sum(a == b for a, b in zip(labels_a, labels_b)) / len(labels_a)
    categories = set(labels_a) | set(labels_b)
    counts_a, counts_b = Counter(labels_a), Counter(labels_b)
    expected = sum(
        counts_a[category] / len(labels_a) * counts_b[category] / len(labels_b)
        for category in categories
    )
    return (observed - expected) / (1 - expected) if expected < 1 else 1.0


def agreement(first: list[dict[str, Any]], second: list[dict[str, Any]]) -> dict[str, float]:
    by_id = {item["id"]: item for item in second}
    pairs = [
        (item["category"], by_id[item["id"]]["category"]) for item in first if item["id"] in by_id
    ]
    overall_a = [a for a, _ in pairs]
    overall_b = [b for _, b in pairs]
    result = {}
    for category in ("direct", "reasoning", "multimodal", "cross_source", "unsupported"):
        category_pairs = [(a, b) for a, b in pairs if a == category or b == category]
        if category_pairs:
            result[category] = kappa(
                [a for a, _ in category_pairs],
                [b for _, b in category_pairs],
            )
    result["overall"] = kappa(overall_a, overall_b) if overall_a else 0.0
    return result


def consensus(first: list[dict[str, Any]], second: list[dict[str, Any]]) -> dict[str, Any]:
    by_id = {item["id"]: item for item in second}
    rows = []
    for item in first:
        other = by_id.get(item["id"])
        if other is None:
            continue
        label_a, label_b = item["category"], other["category"]
        rows.append(
            {
                "id": item["id"],
                "annotator_one": label_a,
                "annotator_two": label_b,
                "consensus": label_a if label_a == label_b else None,
                "disagreement": label_a != label_b,
            }
        )
    return {"rows": rows, "disagreements": [row for row in rows if row["disagreement"]]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("annotator_one", type=Path)
    parser.add_argument("annotator_two", type=Path)
    args = parser.parse_args()
    first = json.loads(args.annotator_one.read_text(encoding="utf-8"))
    second = json.loads(args.annotator_two.read_text(encoding="utf-8"))
    print(
        json.dumps(
            {
                "agreement": agreement(first, second),
                "consensus": consensus(first, second),
            },
            indent=2,
        )
    )
