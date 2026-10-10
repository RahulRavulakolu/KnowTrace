"""Structure-preserving text chunking for source material."""

from typing import Any


def chunk_text(
    text: str,
    page_num: int | None,
    modality: str = "text",
    max_tokens: int = 350,
    extraction_confidence: float = 0.95,
) -> list[dict[str, Any]]:
    """Split text near paragraph boundaries while preserving source provenance."""
    paragraphs = [part.strip() for part in text.splitlines() if part.strip()]
    if not paragraphs and text.strip():
        paragraphs = [text.strip()]
    chunks: list[dict[str, Any]] = []
    current: list[str] = []
    current_words = 0
    for paragraph in paragraphs:
        words = paragraph.split()
        if current and current_words + len(words) > max_tokens:
            chunks.append({
                "text": " ".join(current),
                "page": page_num,
                "modality": modality,
                "extraction_confidence": extraction_confidence,
            })
            current, current_words = [], 0
        if len(words) > max_tokens:
            for start in range(0, len(words), max_tokens):
                segment = words[start:start + max_tokens]
                if current:
                    chunks.append({
                        "text": " ".join(current),
                        "page": page_num,
                        "modality": modality,
                        "extraction_confidence": extraction_confidence,
                    })
                    current, current_words = [], 0
                chunks.append({
                    "text": " ".join(segment),
                    "page": page_num,
                    "modality": modality,
                    "extraction_confidence": extraction_confidence,
                })
        else:
            current.append(paragraph)
            current_words += len(words)
    if current:
        chunks.append({
            "text": " ".join(current),
            "page": page_num,
            "modality": modality,
            "extraction_confidence": extraction_confidence,
        })
    return chunks
