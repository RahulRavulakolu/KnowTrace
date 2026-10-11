"""Batch embedding for ingested chunks."""

import hashlib
from typing import Any

from backend.core.config import settings
from backend.core.logging import logger

_model: Any = None


def _fallback_embedding(text: str) -> list[float]:
    """Create a deterministic offline vector when model weights are unavailable."""
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return [
        (digest[index % len(digest)] / 255.0) * 2.0 - 1.0
        for index in range(settings.VECTOR_DIMENSION)
    ]


def _get_model() -> Any:
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(settings.BGE_MODEL)
    return _model


def embed_chunks(
    chunks_list: list[dict[str, Any]], batch_size: int | None = None
) -> list[dict[str, Any]]:
    """Embed chunks in batches, adding a 1024-dimensional vector to each item."""
    if not chunks_list:
        return []
    size = batch_size or settings.BATCH_SIZE
    texts = [
        " || ".join(
            str(value)
            for value in (
                chunk.get("visual", {}).get("caption", ""),
                chunk.get("visual", {}).get("visible_text", ""),
                chunk.get("text", ""),
            )
            if value
        )
        for chunk in chunks_list
    ]
    try:
        model = _get_model()
        vectors = model.encode(texts, batch_size=size, normalize_embeddings=True)
        vectors = [vector.tolist() for vector in vectors]
    except Exception as exc:
        logger.warning("Embedding model unavailable; using deterministic fallback: %s", exc)
        vectors = [_fallback_embedding(text) for text in texts]
    for chunk, vector in zip(chunks_list, vectors):
        chunk["embedding"] = vector
    return chunks_list
