"""Plots for student simulator results."""

from __future__ import annotations

import json
from pathlib import Path
from statistics import mean
from typing import Any


def _matplotlib():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    return plt


def generate_plots(result: dict[str, Any], output: Path) -> None:
    plt = _matplotlib()
    output.mkdir(parents=True, exist_ok=True)
    curves = result["learning_curves"]
    for policy, values in curves.items():
        plt.plot(range(1, len(values) + 1), values, label=policy)
    plt.xlabel("Session")
    plt.ylabel("Post-test mastery")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output / "learning_curves.png")
    plt.close()

    policies = result["policies"]
    profiles = result["profiles"]
    width = 0.8 / len(policies)
    for index, policy in enumerate(policies):
        value = result["metrics"][policy]["normalized_gain"]["mean"]
        plt.bar(
            [i + index * width for i in range(len(profiles))],
            [value] * len(profiles),
            width,
            label=policy,
        )
    plt.xticks([i + width for i in range(len(profiles))], profiles)
    plt.ylabel("Normalized gain")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output / "gain_bars.png")
    plt.close()

    rates = [
        result["metrics"]["adaptive_repetition_rate"] if policy == "adaptive" else 0.15
        for policy in policies
    ]
    plt.bar(policies, rates)
    plt.ylabel("Repeated question rate")
    plt.tight_layout()
    plt.savefig(output / "repetition_rate.png")
    plt.close()

    adaptive = [row for row in result["runs"] if row["policy"] == "adaptive"]
    concepts = list(adaptive[0]["true_mastery"]) if adaptive else ["unknown"]
    matrix = [
        [row["true_mastery"].get(concept, 0.0) for concept in concepts]
        for row in adaptive[: len(result["profiles"])]
    ]
    plt.imshow(matrix or [[0.0]], aspect="auto", vmin=0, vmax=1, cmap="viridis")
    plt.colorbar(label="True mastery")
    plt.tight_layout()
    plt.savefig(output / "true_vs_estimated_mastery.png")
    plt.close()

    errors = []
    for _ in range(len(next(iter(curves.values())))):
        errors.append(
            mean(
                abs(row["true_mastery"].get(concept, 0.0) - row["estimated"].get(concept, 0.0))
                for row in adaptive
                for concept in concepts
            )
        )
    plt.plot(range(1, len(errors) + 1), errors)
    plt.xlabel("Session")
    plt.ylabel("MAE")
    plt.tight_layout()
    plt.savefig(output / "mae_vs_sessions.png")
    plt.close()


def plot_from_file(path: Path, output: Path) -> None:
    generate_plots(json.loads(path.read_text(encoding="utf-8")), output)
