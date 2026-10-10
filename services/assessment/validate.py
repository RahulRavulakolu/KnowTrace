"""Six-stage question validation with explicit rejection reports."""

from __future__ import annotations

import math
import re
from difflib import SequenceMatcher
from typing import Any

from backend.core.llm import call_llm
from backend.core.logging import logger
from services.assessment.prompts import P15_BLIND_SOLVER, P16_AMBIGUITY_JUDGE, P17_TOPIC_RECLASSIFIER


def _data(response: Any) -> dict[str, Any]:
    value = getattr(response, "data", response)
    return value if isinstance(value, dict) else {}


def normalize_stem(stem: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", stem.lower()).strip()


def span_check(support_span: str, chunk_text: str) -> bool:
    if not support_span or not chunk_text:
        return False
    if len(support_span.split()) > 40:
        return False
    if support_span in chunk_text:
        return True
    span_words = support_span.lower().split()
    source_words = chunk_text.lower().split()
    width = len(span_words)
    return any(
        SequenceMatcher(None, support_span.lower(), " ".join(source_words[index:index + width])).ratio() >= 0.9
        for index in range(max(1, len(source_words) - width + 1))
    )


def blind_solver(question: dict[str, Any], solver: Any = None) -> bool:
    if solver is not None:
        answer = solver(question)
    else:
        answer = _data(call_llm(
            "B",
            f"{P15_BLIND_SOLVER}\nType: {question.get('type')}\nStem: {question.get('stem')}\n"
            f"Options: {question.get('options', [])}",
            json_schema={"type": "object"},
        ))
    proposed = str(question.get("answer", "")).strip().lower()
    solved = str(answer.get("answer", answer) if isinstance(answer, dict) else answer).strip().lower()
    return solved == proposed or solved.rstrip(".") == proposed.rstrip(".")


def mcq_structure(options: list[dict[str, Any]]) -> bool:
    if len(options) != 4:
        return False
    correct = [item for item in options if item.get("is_correct") is True or item.get("correct") is True]
    return len(correct) == 1 and all(
        item.get("is_correct") is True or item.get("correct") is True or bool(item.get("misconception"))
        for item in options
    )


def numerical_code_valid(code: str | None) -> bool:
    """Check that numerical items contain syntactically valid Python."""
    if not code or len(code) > 5000:
        return False
    try:
        compile(code, "<numerical_question>", "exec")
    except SyntaxError:
        return False
    return True


def _cosine(left: list[float], right: list[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right))
    denom = math.sqrt(sum(a * a for a in left) * sum(b * b for b in right))
    return dot / denom if denom else 0.0


def is_duplicate(stem: str, existing: list[Any], embedding: list[float] | None = None) -> bool:
    normalized = normalize_stem(stem)
    for item in existing:
        other_stem = item.get("stem", "") if isinstance(item, dict) else getattr(item, "question_text", "")
        if normalized and normalized == normalize_stem(other_stem):
            return True
        other_embedding = item.get("embedding") if isinstance(item, dict) else getattr(item, "embedding", None)
        if embedding and other_embedding and _cosine(embedding, other_embedding) > 0.88:
            return True
    return False


def validate_question(
    question: dict[str, Any],
    chunk: Any,
    concept: Any,
    db_session: Any = None,
    solver: Any = None,
    existing: list[Any] | None = None,
) -> dict[str, Any]:
    _ = db_session
    report: dict[str, Any] = {
        "span_ok": span_check(question.get("support_span", ""), chunk.text),
        "solver_agrees": False,
        "structure_ok": True,
        "ambiguous": False,
        "topic_mismatch": False,
        "duplicate": False,
        "rejection_reason": None,
    }
    if not report["span_ok"]:
        report["rejection_reason"] = "span_check"
    elif not (report.__setitem__("solver_agrees", blind_solver(question, solver)) or report["solver_agrees"]):
        report["rejection_reason"] = "blind_solver"
    elif question.get("type") == "mcq" and not mcq_structure(question.get("options", [])):
        report["structure_ok"] = False
        report["rejection_reason"] = "mcq_structure"
    elif question.get("type") == "numerical" and not numerical_code_valid(question.get("numerical_python")):
        report["rejection_reason"] = "numerical_code"
    else:
        ambiguity = _data(call_llm(
            "B", f"{P16_AMBIGUITY_JUDGE}\nStem: {question.get('stem')}\nOptions: {question.get('options', [])}",
            json_schema={"type": "object"},
        ))
        report["ambiguous"] = bool(ambiguity.get("ambiguous") or ambiguity.get("multiple_correct"))
        if report["ambiguous"]:
            report["rejection_reason"] = "ambiguity"
        else:
            topic = _data(call_llm(
                "B", f"{P17_TOPIC_RECLASSIFIER}\nTarget concept: {concept.id} {concept.name}\n"
                f"Question: {question.get('stem')}", json_schema={"type": "object"},
            ))
            report["topic_mismatch"] = (
                str(topic.get("concept_id", concept.id)) != str(concept.id)
                and float(topic.get("confidence", 0.0)) > 0.7
            )
            if report["topic_mismatch"]:
                report["rejection_reason"] = "topic_mismatch"
            elif is_duplicate(question.get("stem", ""), existing or []):
                report["duplicate"] = True
                report["rejection_reason"] = "duplicate"
    status = "approved" if report["rejection_reason"] is None else "rejected"
    if status == "rejected":
        logger.info("Question rejected at stage=%s", report["rejection_reason"])
    return {"status": status, "validation_report": report}


def validate_and_persist(question: Question, chunk: Any, concept: Any, db_session: Any) -> dict[str, Any]:
    draft = {
        "type": question.question_type, "stem": question.question_text,
        "options": question.options or [], "answer": question.correct_answer,
        "support_span": question.support_span or "",
    }
    result = validate_question(draft, chunk, concept, db_session)
    question.status = result["status"]
    question.validation_notes = result["validation_report"]
    db_session.commit()
    return result
