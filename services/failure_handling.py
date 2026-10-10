"""Explicit degraded-mode policies shared by ingestion and retrieval services."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class DegradedResult:
    value: Any
    mode: str
    message: str


def with_pdf_fallback(primary: Callable[[], Any], secondary: Callable[[], Any]) -> DegradedResult:
    try:
        return DegradedResult(primary(), "primary", "")
    except Exception as primary_error:
        try:
            return DegradedResult(secondary(), "secondary_parser", str(primary_error))
        except Exception as secondary_error:
            raise RuntimeError(
                f"PDF parsing failed in both parsers: {secondary_error}"
            ) from secondary_error


def scanned_pdf_route(text: str, threshold: int = 50) -> str:
    return "ocr" if len(text.strip()) < threshold else "text"


def video_policy(duration_seconds: float | None, cap_seconds: float = 1800.0) -> DegradedResult:
    if duration_seconds is not None and duration_seconds > cap_seconds:
        return DegradedResult(
            min(duration_seconds, cap_seconds),
            "capped",
            "Video exceeds 30 minutes; audio-first processing capped at 30 minutes.",
        )
    return DegradedResult(duration_seconds, "standard", "")


def audio_confidence_policy(confidence: float, threshold: float = 0.4) -> DegradedResult:
    if confidence < threshold:
        return DegradedResult(
            True, "low_confidence", "Audio transcription confidence is below 0.4."
        )
    return DegradedResult(False, "normal", "")


def vision_failure(image_ref: str | Path, error: Exception) -> dict[str, Any]:
    return {
        "caption": "figure unreadable",
        "image_uri": str(image_ref),
        "warning": str(error),
        "degraded_mode": "vision_unreadable",
    }


def llm_failure_message(error: Exception) -> str:
    return f"AI service temporarily unavailable after retries: {error}"


def reranker_failure_message() -> str:
    return "Degraded mode: using retrieval order without semantic reranking."


def vector_failure_message() -> str:
    return "Searching without semantic ranking; keyword results are still available."


def cold_start_prior(self_rating: int | None = None) -> float:
    return 0.3 if self_rating is None else 0.2 + 0.1 * max(0, min(4, self_rating - 1))


def resample_question(bank: list[Any], served_ids: set[str]) -> Any | None:
    def question_id(question: Any) -> str:
        return (
            str(question.get("id", ""))
            if isinstance(question, dict)
            else str(getattr(question, "id", ""))
        )

    return next((question for question in bank if question_id(question) not in served_ids), None)
