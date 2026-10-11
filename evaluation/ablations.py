"""Run retrieval ablations over recorded benchmark responses.

The runner accepts a JSONL/JSON response fixture so experiments are reproducible
without mutating the production retrieval pipeline.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from evaluation.metrics import bootstrap_ci

CONFIGS = {
    "A": "dense only",
    "B": "hybrid dense + BM25 + RRF",
    "C": "hybrid + rerank",
    "D": "hybrid + rerank + claim verification",
    "E": "hybrid + rerank without vision captions",
}


def run(rows: list[dict[str, Any]], output: Path) -> dict[str, Any]:
    result = []
    for config, description in CONFIGS.items():
        metrics = {}
        for metric in (
            "faithfulness",
            "context_recall",
            "context_precision",
            "citation_accuracy",
            "citation_recall",
        ):
            values = [float(row.get(config, {}).get(metric, row.get(metric, 0.0))) for row in rows]
            metrics[metric] = bootstrap_ci(values)
        result.append({"config": config, "description": description, **metrics})
    payload = {
        "configs": result,
        "insights": "Compare confidence intervals before claiming a component improves performance.",
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, default=Path("evaluation/results/ablations.json"))
    args = parser.parse_args()
    data = json.loads(args.input.read_text(encoding="utf-8"))
    run(data, args.output)
