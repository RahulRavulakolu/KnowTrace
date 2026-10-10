import json
from pathlib import Path

from evaluation.metrics import (
    bootstrap_ci,
    citation_accuracy,
    citation_recall,
    hit_at_k,
    location_match,
    mrr,
    refusal_metrics,
)
from scripts.annotation_agreement import agreement
from evaluation.ablations import CONFIGS, run as run_ablations


ROOT = Path(__file__).parents[1]


def test_benchmark_coverage() -> None:
    benchmark = json.loads((ROOT / "evaluation" / "benchmark.json").read_text(encoding="utf-8"))
    assert len(benchmark) == 100
    counts = {category: sum(item["category"] == category for item in benchmark)
              for category in ("direct", "reasoning", "multimodal", "cross_source", "unsupported")}
    assert counts == {"direct": 25, "reasoning": 25, "multimodal": 20, "cross_source": 15, "unsupported": 15}
    assert all(set(item) >= {"id", "category", "question", "reference_answer", "gold_locations", "answerable"} for item in benchmark)
    assert all(item["gold_locations"] for item in benchmark if item["answerable"])
    assert all(not item["gold_locations"] for item in benchmark if not item["answerable"])


def test_annotation_agreement() -> None:
    benchmark = json.loads((ROOT / "evaluation" / "benchmark.json").read_text(encoding="utf-8"))
    result = agreement(benchmark, benchmark)
    assert result["overall"] >= 0.7


def test_location_matching() -> None:
    assert location_match({"source": "book.pdf", "page": 4}, {"source": "book.pdf", "page": 4})
    assert not location_match({"source": "book.pdf", "page": 5}, {"source": "book.pdf", "page": 4})
    assert location_match({"source": "lecture.mp4", "ts": (100, 120)}, {"source": "lecture.mp4", "ts": [105, 115]})


def test_retrieval_metrics() -> None:
    ranked = [{"source": "book.pdf", "page": 4}, {"source": "book.pdf", "page": 5}]
    gold = [{"source": "book.pdf", "page": 4}]
    assert hit_at_k(ranked, gold, 1) == 1.0
    assert mrr([(ranked, gold)]) == 1.0


def test_citation_and_refusal_metrics() -> None:
    gold = [{"source": "book.pdf", "page": 4}]
    citations = [{"source": "book.pdf", "page": 4}]
    assert citation_accuracy(citations, gold) == 1.0
    assert citation_recall(citations, gold) == 1.0
    refusal = refusal_metrics([True, False, True], [True, False, False])
    assert refusal["precision"] == 0.5
    assert refusal["recall"] == 1.0


def test_bootstrap_ci() -> None:
    result = bootstrap_ci([0.2, 0.5, 0.8], iterations=200)
    assert 0 <= result["lower"] <= result["mean"] <= result["upper"] <= 1


def test_ablations_complete(tmp_path: Path) -> None:
    rows = [
        {
            config: {
                "faithfulness": 0.5,
                "context_recall": 0.5,
                "context_precision": 0.5,
                "citation_accuracy": 0.5,
                "citation_recall": 0.5,
            }
            for config in CONFIGS
        }
    ]
    result = run_ablations(rows, tmp_path / "ablations.json")
    assert {item["config"] for item in result["configs"]} == set(CONFIGS)
    assert all("faithfulness" in item and "mean" in item["faithfulness"] for item in result["configs"])
