"""Focused tests for file ingestion, provenance, and embeddings."""

import uuid

from services.ingestion.chunking import chunk_text
from services.ingestion.embed import embed_chunks
from services.ingestion.classifier import detect_file_type


def test_classifier_and_chunking() -> None:
    """PDF signatures and page provenance are preserved."""
    assert detect_file_type(b"%PDF-1.7\n", "material.bin") == "pdf"
    chunks = chunk_text("Paragraph one.\n\nParagraph two.", 3)
    assert chunks[0]["page"] == 3
    assert chunks[0]["extraction_confidence"] == 0.95


def test_embedding_dimension() -> None:
    """Embedding output always has the configured 1024 dimensions."""
    chunks = embed_chunks([{"text": "A source anchored chunk", "visual": {}}])
    assert len(chunks[0]["embedding"]) == 1024


def test_upload_pdf_creates_idempotent_source(client) -> None:
    """Uploading identical bytes twice reuses the existing source."""
    content = b"%PDF-1.7\nsynthetic ingestion fixture\n"
    course = client.post("/courses", json={"title": f"Phase 2 {uuid.uuid4()}"}).json()
    first = client.post(
        f"/courses/{course['course_id']}/sources",
        files={"files": ("sample.pdf", content, "application/pdf")},
    )
    second = client.post(
        f"/courses/{course['course_id']}/sources",
        files={"files": ("sample.pdf", content, "application/pdf")},
    )
    assert first.status_code == 202
    assert second.status_code == 202
    assert first.json()["source_ids"] == second.json()["source_ids"]
