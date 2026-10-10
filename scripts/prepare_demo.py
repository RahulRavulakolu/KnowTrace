"""Prepare deterministic offline demo artifacts without provider calls."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from evaluation.simulator import run_experiment  # noqa: E402


def prepare(output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    result = run_experiment(seeds=2, sessions=3, questions_per_session=10)
    (output / "simulator_snapshot.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    students = {
        "fresh": {"email": "fresh_user@demo.local", "history": [], "status": "onboarded"},
        "returning": {
            "email": "returning_user@demo.local",
            "history": [{"session": index, "mastery": 0.3 + index * 0.1} for index in range(1, 4)],
            "active_misconception": "precision-recall",
        },
    }
    (output / "students.json").write_text(json.dumps(students, indent=2), encoding="utf-8")
    (output / "README.txt").write_text(
        "Offline demo fixture. Provider calls are not made; replace this snapshot with "
        "course ingestion artifacts for a live demo.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("data/demo_data"))
    args = parser.parse_args()
    prepare(args.output)
