"""Draft benchmark questions from chunks using the central LLM gateway."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from backend.core.llm import call_llm

P22 = """Draft one benchmark question from this source chunk.
Return JSON with category, question, reference_answer, gold_locations, answerable.
Categories are direct, reasoning, multimodal, cross_source, unsupported.
Use unsupported only when the supplied source cannot answer the question.
Chunk: {chunk}"""


def draft(chunks: list[dict[str, Any]], per_category: int = 20) -> list[dict[str, Any]]:
    rows = []
    for chunk in chunks:
        response = call_llm("A", P22.format(chunk=chunk), json_schema={"type": "object"})
        data = getattr(response, "data", response)
        if isinstance(data, dict):
            rows.append(data)
        if len(rows) >= per_category * 5:
            break
    return rows


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("chunks", type=Path)
    parser.add_argument("--output", type=Path, default=Path("evaluation/draft_benchmark.json"))
    args = parser.parse_args()
    chunks = json.loads(args.chunks.read_text(encoding="utf-8"))
    args.output.write_text(json.dumps(draft(chunks), indent=2), encoding="utf-8")
