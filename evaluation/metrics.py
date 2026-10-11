"""Evaluation metrics used by benchmark, RAGAS, and ablation runners."""

from __future__ import annotations

import random
from collections.abc import Iterable, Sequence
from typing import Any


def location_match(retrieved_chunk: dict[str, Any], gold_location: dict[str, Any]) -> bool:
    """Match PDF pages, slide numbers, or overlapping video intervals."""
    if retrieved_chunk.get("source") and gold_location.get("source"):
        if retrieved_chunk["source"] != gold_location["source"]:
            return False
    if "page" in gold_location:
        return retrieved_chunk.get("page") == gold_location["page"]
    if "slide" in gold_location:
        return retrieved_chunk.get("slide") == gold_location["slide"]
    gold = gold_location.get("ts")
    if not gold or retrieved_chunk.get("ts") is None:
        return False
    retrieved = retrieved_chunk["ts"]
    if isinstance(retrieved, (int, float)):
        retrieved = (retrieved, retrieved)
    overlap = max(0.0, min(retrieved[1], gold[1]) - max(retrieved[0], gold[0]))
    return overlap >= 0.5 * max(float(gold[1]) - float(gold[0]), 0.0)


def hit_at_k(ranked: Sequence[dict[str, Any]], gold: Sequence[dict[str, Any]], k: int) -> float:
    return float(any(location_match(item, target) for item in ranked[:k] for target in gold))


def mrr(
    ranked_queries: Iterable[tuple[Sequence[dict[str, Any]], Sequence[dict[str, Any]]]],
) -> float:
    values = []
    for ranked, gold in ranked_queries:
        rank = next(
            (
                index
                for index, item in enumerate(ranked, 1)
                if any(location_match(item, target) for target in gold)
            ),
            None,
        )
        values.append(1.0 / rank if rank else 0.0)
    return sum(values) / max(len(values), 1)


def citation_accuracy(citations: Sequence[dict[str, Any]], gold: Sequence[dict[str, Any]]) -> float:
    if not citations:
        return 0.0
    return sum(
        any(location_match(citation, target) for target in gold) for citation in citations
    ) / len(citations)


def citation_recall(citations: Sequence[dict[str, Any]], gold: Sequence[dict[str, Any]]) -> float:
    if not gold:
        return 1.0
    return sum(
        any(location_match(citation, target) for citation in citations) for target in gold
    ) / len(gold)


def refusal_metrics(
    predicted_refusals: Sequence[bool], unsupported: Sequence[bool]
) -> dict[str, float]:
    true_refusals = sum(pred and gold for pred, gold in zip(predicted_refusals, unsupported))
    all_refusals = sum(predicted_refusals)
    all_unsupported = sum(unsupported)
    false_refusals = sum(pred and not gold for pred, gold in zip(predicted_refusals, unsupported))
    answerable = sum(not gold for gold in unsupported)
    return {
        "precision": true_refusals / max(all_refusals, 1),
        "recall": true_refusals / max(all_unsupported, 1),
        "over_refusal": false_refusals / max(answerable, 1),
    }


def bootstrap_ci(
    values: Sequence[float], iterations: int = 1000, seed: int = 7
) -> dict[str, float]:
    """Return percentile bootstrap confidence intervals for per-question values."""
    if not values:
        return {"mean": 0.0, "lower": 0.0, "upper": 0.0}
    rng = random.Random(seed)
    samples = [sum(rng.choice(values) for _ in values) / len(values) for _ in range(iterations)]
    samples.sort()
    return {
        "mean": sum(values) / len(values),
        "lower": samples[max(0, int(iterations * 0.025) - 1)],
        "upper": samples[min(iterations - 1, int(iterations * 0.975))],
    }
