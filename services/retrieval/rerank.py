"""Cross-encoder reranking with a safe degraded fallback."""

from typing import Any

from backend.core.config import settings
from backend.core.logging import logger

_model: Any = None


def rerank(query: str, chunks: list[Any], top_k: int = 6) -> list[Any]:
    """Rerank chunks and enforce source diversity where possible."""
    global _model
    if not chunks:
        return []
    try:
        if _model is None:
            from sentence_transformers import CrossEncoder
            _model = CrossEncoder(settings.RERANKER_MODEL)
        scores = _model.predict([(query, chunk.text) for chunk in chunks])
        ranked = sorted(zip(chunks, scores), key=lambda item: float(item[1]), reverse=True)
    except Exception as exc:
        logger.warning("Reranker unavailable; using RRF order: %s", exc)
        ranked = [(chunk, float(getattr(chunk, "_retrieval_score", 0.0))) for chunk in chunks]
    selected = []
    sources: set[str] = set()
    for chunk, score in ranked:
        setattr(chunk, "_rerank_score", max(0.0, float(score)))
        if len(selected) < top_k:
            selected.append(chunk)
            sources.add(str(chunk.source_id))
    if selected and len(sources) == 1:
        top_score = float(getattr(selected[0], "_rerank_score", 0.0))
        for candidate, score in ranked[top_k:]:
            if str(candidate.source_id) not in sources and float(score) >= 0.5 * top_score:
                selected[-1] = candidate
                break
    for index, chunk in enumerate(selected, start=1):
        setattr(chunk, "_source_label", f"[S{index}]")
    return selected
