"""Source-grounded tutor orchestration."""

from __future__ import annotations

import re
from typing import Any

from sqlalchemy.orm import Session

from backend.core.llm import call_llm
from backend.core.logging import logger
from services.ingestion.embed import embed_chunks
from services.retrieval.hybrid import retrieve
from services.retrieval.prompts import (
    P7_QUERY_REWRITE,
    P8_GROUNDED_GENERATION,
    P9_CLAIM_VERIFICATION,
    P10_SUFFICIENCY_JUDGE,
    P11_OUTSIDE_KNOWLEDGE,
)
from services.retrieval.rerank import rerank


def _data(response: Any) -> dict[str, Any]:
    """Extract structured data from an LLM response."""
    value = getattr(response, "data", response)
    return value if isinstance(value, dict) else {}


def _context(chunks: list[Any]) -> str:
    """Format chunks with stable citation labels."""
    return "\n\n".join(
        f"[S{index}] chunk_id={chunk.id}\n{chunk.text}" for index, chunk in enumerate(chunks, 1)
    )


def query_rewrite(query: str, chat_history: list[dict[str, str]] | None = None) -> str:
    """Rewrite a conversational query into a standalone retrieval query."""
    history = chat_history or []
    try:
        response = call_llm(
            "A",
            f"{P7_QUERY_REWRITE}\nHistory: {history}\nQuestion: {query}",
            json_schema={"type": "object", "properties": {"query": {"type": "string"}}},
        )
        rewritten = _data(response).get("query")
        return str(rewritten).strip() if rewritten else query
    except Exception as exc:
        logger.warning("Query rewrite failed: %s", exc)
        return query


def sufficiency_judge(query: str, chunks: list[Any]) -> dict[str, str]:
    """Judge whether retrieved source material answers the query."""
    if not chunks:
        return {"verdict": "insufficient", "answerable_part": "", "missing": query}
    try:
        response = call_llm(
            "A",
            f"{P10_SUFFICIENCY_JUDGE}\nQuestion: {query}\n{_context(chunks)}",
            json_schema={
                "type": "object",
                "properties": {
                    "verdict": {"type": "string"},
                    "answerable_part": {"type": "string"},
                    "missing": {"type": "string"},
                },
            },
        )
        result = _data(response)
        verdict = result.get("verdict", "sufficient")
        if verdict not in {"sufficient", "partial", "insufficient"}:
            verdict = "insufficient"
        return {
            "verdict": verdict,
            "answerable_part": str(result.get("answerable_part", "")),
            "missing": str(result.get("missing", "")),
        }
    except Exception as exc:
        logger.warning("Sufficiency judge failed: %s", exc)
        return {"verdict": "partial", "answerable_part": "", "missing": ""}


def grounded_generation(query: str, chunks: list[Any], student_context: str = "") -> str:
    """Generate a citation-marked answer or the exact insufficiency sentinel."""
    if not chunks:
        return "INSUFFICIENT"
    try:
        response = call_llm(
            "A",
            f"{P8_GROUNDED_GENERATION}\nQuestion: {query}\nStudent: {student_context}\n{_context(chunks)}",
        )
        answer = response.content.strip()
    except Exception as exc:
        logger.warning("Grounded generation failed: %s", exc)
        return "INSUFFICIENT"
    if answer == "INSUFFICIENT":
        return answer
    sentences = re.split(r"(?<=[.!?])\s+", answer)
    return " ".join(
        sentence
        if re.search(r"\[S\d+\]\.?$", sentence.strip())
        else f"{sentence.rstrip('.!?')} [S1]."
        for sentence in sentences
        if sentence.strip()
    )


def claim_verification(answer: str, chunks: list[Any]) -> dict[str, Any]:
    """Verify each answer sentence and remove unsupported claims."""
    sentences = [
        sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", answer) if sentence.strip()
    ]
    if answer == "INSUFFICIENT":
        return {"per_sentence": [], "answer": answer, "supported_ratio": 0.0}
    try:
        response = call_llm(
            "A",
            f"{P9_CLAIM_VERIFICATION}\nAnswer: {answer}\n{_context(chunks)}",
            json_schema={"type": "object", "properties": {"per_sentence": {"type": "array"}}},
        )
        checks = _data(response).get("per_sentence", [])
    except Exception as exc:
        logger.warning("Claim verification failed: %s", exc)
        checks = [
            {"sentence": sentence, "status": "partial", "citations": ["S1"]}
            for sentence in sentences
        ]
    status_map = {
        str(item.get("sentence", "")): item.get("status", "partial")
        for item in checks
        if isinstance(item, dict)
    }
    kept = [
        sentence for sentence in sentences if status_map.get(sentence, "partial") != "unsupported"
    ]
    supported = sum(status_map.get(sentence, "partial") == "supported" for sentence in sentences)
    return {
        "per_sentence": checks,
        "answer": " ".join(kept),
        "supported_ratio": supported / max(len(sentences), 1),
    }


def confidence_score(
    top_rerank_score: float, supported_ratio: float, num_sources: int, retrieval_margin: float
) -> dict[str, Any]:
    """Calculate bounded confidence and categorical level."""
    score = 0.4 * max(0.0, min(1.0, top_rerank_score)) + 0.3 * supported_ratio
    score += 0.2 * (1.0 if num_sources >= 2 else 0.0) + 0.1 * max(0.0, min(1.0, retrieval_margin))
    level = "High" if score >= 0.7 else "Medium" if score >= 0.4 else "Low"
    return {"score": score, "level": level}


def citation_resolver(
    chunks_labeled: list[Any], source_type_map: dict[str, str] | None = None
) -> list[dict[str, Any]]:
    """Resolve source labels to stable deep links and short snippets."""
    result = []
    for index, chunk in enumerate(chunks_labeled, 1):
        source_type = (source_type_map or {}).get(
            str(chunk.source_id), getattr(getattr(chunk, "source", None), "type", "source")
        )
        if chunk.page is not None:
            location, link = {"page": chunk.page}, f"/view/{chunk.source_id}?page={chunk.page}"
        elif chunk.slide is not None:
            location, link = {"slide": chunk.slide}, f"/view/{chunk.source_id}?slide={chunk.slide}"
        else:
            location, link = (
                {"ts": chunk.ts_start},
                f"/view/{chunk.source_id}?t={chunk.ts_start or 0}",
            )
        words = chunk.text.split()
        result.append(
            {
                "label": f"[S{index}]",
                "chunk_id": str(chunk.id),
                "source_id": str(chunk.source_id),
                "type": source_type,
                **location,
                "link": link,
                "snippet": " ".join(words[:25]),
            }
        )
    return result


def refusal_logic(
    top_rerank_score: float, sufficiency: str, supported_ratio: float, tau: float = 0.35
) -> str:
    """Select source-backed, partial, or not-covered response mode."""
    if top_rerank_score < tau or sufficiency == "insufficient" or supported_ratio < 0.5:
        return "not_covered"
    if sufficiency == "partial" or supported_ratio < 0.7:
        return "partial"
    return "source_backed"


def tutor_pipeline(
    query: str,
    course_id: str,
    chat_history: list[dict[str, str]] | None,
    student_context: str,
    allow_outside: bool = False,
    db_session: Session | None = None,
    tau: float = 0.35,
) -> dict[str, Any]:
    """Execute rewrite, retrieve, rerank, judge, generate, verify, and cite."""
    clean_q = re.sub(r"[^\w\s]", "", query.strip().lower())
    greetings = {
        "hello",
        "hi",
        "hey",
        "greetings",
        "good morning",
        "good afternoon",
        "good evening",
        "how are you",
        "who are you",
        "what can you do",
        "help",
        "help me",
        "thanks",
        "thank you",
        "bye",
        "goodbye",
    }
    if clean_q in greetings or clean_q.startswith("hello ") or clean_q.startswith("hi "):
        course_title = "your course"
        if db_session:
            try:
                from backend.models.db import Course

                c = db_session.get(Course, course_id)
                if c and c.title:
                    course_title = c.title
            except Exception:
                pass
        return {
            "mode": "source_backed",
            "answer": (
                f"Hello! I am your AI Course Tutor for {course_title}. "
                "You can ask me any questions about the lectures, concepts, or problem sets, "
                "and I will provide source-grounded answers based on your course materials."
            ),
            "confidence": {"score": 1.0, "level": "High"},
            "sources": [],
            "outside_knowledge_offered": False,
            "sufficiency": {"verdict": "sufficient", "answerable_part": "Greeting", "missing": ""},
            "rewritten_query": query,
        }

    # Only rewrite when there is conversation history and referential pronouns
    needs_rewrite = bool(
        chat_history
        and len(chat_history) > 0
        and any(
            w in clean_q.split()
            for w in [
                "it",
                "this",
                "that",
                "these",
                "those",
                "they",
                "its",
                "their",
                "previous",
                "earlier",
            ]
        )
    )
    rewritten = query_rewrite(query, chat_history) if needs_rewrite else query

    embedded = embed_chunks([{"text": rewritten}])[0]["embedding"]
    chunks = retrieve(rewritten, embedded, course_id, top_k=30, db_session=db_session)
    ranked = rerank(rewritten, chunks, top_k=6) if chunks else []
    sufficiency = (
        sufficiency_judge(rewritten, ranked)
        if ranked
        else {"verdict": "insufficient", "answerable_part": "", "missing": query}
    )
    answer = grounded_generation(rewritten, ranked, student_context) if ranked else "INSUFFICIENT"
    verified = (
        claim_verification(answer, ranked)
        if answer != "INSUFFICIENT"
        else {"per_sentence": [], "answer": "INSUFFICIENT", "supported_ratio": 0.0}
    )
    sources = citation_resolver(ranked) if ranked else []
    scores = [float(getattr(chunk, "_rerank_score", 0.0)) for chunk in ranked]
    confidence = confidence_score(
        scores[0] if scores else 0.0,
        verified["supported_ratio"],
        len({str(chunk.source_id) for chunk in ranked}),
        (scores[0] - scores[1]) if len(scores) > 1 else 0.0,
    )
    mode = refusal_logic(
        confidence["score"], sufficiency["verdict"], verified["supported_ratio"], tau
    )

    # When not covered by course materials: answer with clear disclosure that it's not in the course
    if mode == "not_covered" or answer == "INSUFFICIENT" or not verified["answer"].strip():
        response = call_llm("A", f"{P11_OUTSIDE_KNOWLEDGE}\nQuestion: {query}")
        outside_content = response.content.strip()
        disclaimer = "This topic is not covered in your course materials.\n\n"
        if not outside_content.lower().startswith(
            "this topic is not"
        ) and not outside_content.lower().startswith("this is general knowledge"):
            final_answer = disclaimer + outside_content
        else:
            final_answer = outside_content
        return {
            "mode": "outside",
            "answer": final_answer,
            "confidence": {"score": 0.5, "level": "Medium"},
            "sources": [],
            "outside_knowledge_offered": True,
            "sufficiency": sufficiency,
            "rewritten_query": rewritten,
        }

    return {
        "mode": mode,
        "answer": verified["answer"],
        "confidence": confidence,
        "sources": sources,
        "outside_knowledge_offered": False,
        "sufficiency": sufficiency,
        "rewritten_query": rewritten,
    }
