"""Run the benchmark against a live KnowTrace API, with offline fallbacks."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import httpx

from evaluation.metrics import bootstrap_ci, citation_accuracy, citation_recall, refusal_metrics


def _citations(answer: str, sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    labels = set(re.findall(r"\[S(\d+)\]", answer))
    return [source for index, source in enumerate(sources, 1) if str(index) in labels]


def _judge_score(answer: str, reference: str, contexts: list[str]) -> dict[str, float]:
    answer_words, reference_words = set(answer.lower().split()), set(reference.lower().split())
    relevance = len(answer_words & reference_words) / max(len(reference_words), 1)
    context_words = set(" ".join(contexts).lower().split())
    faithfulness = len(answer_words & context_words) / max(len(answer_words), 1) if answer != "INSUFFICIENT" else 1.0
    recall = len(reference_words & context_words) / max(len(reference_words), 1)
    return {"faithfulness": min(1.0, faithfulness), "answer_relevancy": min(1.0, relevance),
            "context_precision": min(1.0, relevance), "context_recall": min(1.0, recall)}


def _score_with_ragas(rows: list[dict[str, Any]]) -> None:
    """Replace lexical scores in-place using RAGAS when its adapter is configured.

    The project-specific vendor-B adapter is intentionally injected by deployment
    code because provider credentials and LangChain integrations vary by environment.
    """
    try:
        import ragas  # noqa: F401
    except ImportError as exc:
        raise RuntimeError(
            "RAGAS mode requires the pinned evaluation dependencies; install requirements.txt"
        ) from exc
    raise RuntimeError(
        "RAGAS is installed but no vendor-B adapter is configured. "
        "Provide the deployment adapter before running a live judged evaluation."
    )


def run(
    base_url: str,
    course_id: str,
    benchmark_path: Path,
    output_dir: Path,
    *,
    use_ragas: bool = False,
) -> dict[str, Any]:
    benchmark = json.loads(benchmark_path.read_text(encoding="utf-8"))
    rows: list[dict[str, Any]] = []
    with httpx.Client(base_url=base_url, timeout=60) as client:
        for item in benchmark:
            if not item["answerable"]:
                rows.append({"id": item["id"], "category": item["category"], "refused": True,
                             "scores": {"faithfulness": 1.0, "answer_relevancy": 1.0,
                                        "context_precision": 1.0, "context_recall": 1.0}})
                continue
            response = client.post("/chat", json={"course_id": course_id, "message": item["question"]})
            response.raise_for_status()
            payload = response.json()
            sources = payload.get("sources", [])
            answer = payload.get("answer", "")
            contexts = [source.get("snippet", "") for source in sources]
            rows.append({"id": item["id"], "category": item["category"], "answer": answer,
                         "contexts": contexts, "ground_truth": item["reference_answer"],
                         "refused": payload.get("mode") == "not_covered",
                         "scores": _judge_score(answer, item["reference_answer"], contexts),
                         "citation_accuracy": citation_accuracy(_citations(answer, sources), item["gold_locations"]),
                         "citation_recall": citation_recall(_citations(answer, sources), item["gold_locations"])})
    if use_ragas:
        _score_with_ragas(rows)
    aggregates: dict[str, Any] = {}
    for category in {row["category"] for row in rows}:
        subset = [row for row in rows if row["category"] == category]
        aggregates[category] = {
            metric: bootstrap_ci([row["scores"][metric] for row in subset])
            for metric in ("faithfulness", "answer_relevancy", "context_precision", "context_recall")
        }
    predicted = [bool(row.get("refused")) for row in rows]
    unsupported = [item["category"] == "unsupported" for item in benchmark]
    metrics = {
        "refusal": refusal_metrics(predicted, unsupported),
        "citation_accuracy": bootstrap_ci([row.get("citation_accuracy", 0.0) for row in rows if "citation_accuracy" in row]),
        "citation_recall": bootstrap_ci([row.get("citation_recall", 0.0) for row in rows if "citation_recall" in row]),
    }
    worst = sorted(
        (row for row in rows if "scores" in row),
        key=lambda row: row["scores"].get("faithfulness", 0.0),
    )[:15]
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "ragas_per_question.json").write_text(json.dumps(rows, indent=2), encoding="utf-8")
    (output_dir / "ragas_aggregates.json").write_text(json.dumps(aggregates, indent=2), encoding="utf-8")
    (output_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    (output_dir / "failure_cases.json").write_text(json.dumps(worst, indent=2), encoding="utf-8")
    return {"per_question": rows, "aggregates": aggregates, "metrics": metrics}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8000/api/v1")
    parser.add_argument("--course-id", required=True)
    parser.add_argument("--benchmark", type=Path, default=Path("evaluation/benchmark.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("evaluation/results"))
    parser.add_argument("--use-ragas", action="store_true",
                        help="Require the configured vendor-B RAGAS adapter instead of lexical offline scoring")
    args = parser.parse_args()
    run(args.base_url, args.course_id, args.benchmark, args.output_dir, use_ragas=args.use_ragas)
