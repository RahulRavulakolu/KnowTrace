from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from evaluation.plots import generate_plots  # noqa: E402
from evaluation.simulator import run_experiment, save_results  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the independent SimStudent personalization experiment."
    )
    parser.add_argument("--seeds", type=int, default=10)
    parser.add_argument("--sessions", type=int, default=6)
    parser.add_argument("--questions-per-session", type=int, default=15)
    parser.add_argument("--output", type=Path, default=Path("evaluation/results"))
    args = parser.parse_args()
    result = run_experiment(args.seeds, args.sessions, args.questions_per_session)
    save_results(result, args.output)
    generate_plots(result, args.output)


if __name__ == "__main__":
    main()
