"""PDF extraction with page and figure provenance."""

from pathlib import Path
from typing import Any, Iterator

import fitz

from backend.core.config import settings
from backend.core.llm import call_llm
from backend.core.logging import logger
from services.ingestion.chunking import chunk_text
from services.ingestion.prompts import FIGURE_PROMPT, OCR_PROMPT


def _vision_data(prompt: str, image_path: Path) -> dict[str, Any]:
    """Call the vision gateway and return a safe metadata dictionary."""
    try:
        response = call_llm(
            "A",
            prompt,
            json_schema={
                "type": "object",
                "properties": {
                    "caption": {"type": "string"},
                    "description": {"type": "string"},
                    "structured_data": {"type": "object"},
                },
            },
            images=[image_path],
        )
        return response.data if isinstance(response.data, dict) else {}
    except Exception as exc:
        logger.warning("Vision extraction failed for %s: %s", image_path, exc)
        return {"warning": str(exc)}


def extract_text_and_images(
    pdf_path: str | Path, course_id: str, source_id: str
) -> Iterator[dict[str, Any]]:
    """Yield text and figure chunks from a PDF, isolating failures per page."""
    processed_dir = Path(settings.DATA_DIR) / "processed" / source_id
    processed_dir.mkdir(parents=True, exist_ok=True)
    document = fitz.open(str(pdf_path))
    try:
        for page_index, page in enumerate(document):
            page_number = page_index + 1
            try:
                blocks = page.get_text("blocks")
                text = "\n".join(str(block[4]).strip() for block in blocks if str(block[4]).strip())
                confidence = 0.95
                if len(text) < 50:
                    try:
                        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                        ocr_path = processed_dir / f"page_{page_number}_ocr.png"
                        pixmap.save(str(ocr_path))
                        data = _vision_data(OCR_PROMPT, ocr_path)
                        text = str(data.get("text") or text)
                        confidence = 0.6
                    except Exception as exc:
                        logger.warning("OCR failed on PDF page %d: %s", page_number, exc)
                for chunk in chunk_text(
                    text,
                    page_number,
                    max_tokens=settings.CHUNK_SIZE,
                    extraction_confidence=confidence,
                ):
                    chunk.update({"course_id": course_id, "source_id": source_id})
                    yield chunk

                rectangles = [fitz.Rect(d["rect"]) for d in page.get_drawings() if d.get("rect")]
                image_rectangles = []
                for image in page.get_images(full=True):
                    image_rectangles.extend(page.get_image_rects(image[0]))
                for figure_index, rect in enumerate(image_rectangles + rectangles):
                    if rect.width <= 2 or rect.height <= 2:
                        continue
                    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), clip=rect)
                    figure_path = processed_dir / f"page_{page_number}_figure_{figure_index}.png"
                    pixmap.save(str(figure_path))
                    visual = _vision_data(FIGURE_PROMPT, figure_path)
                    figure_text = visual.get("description") or visual.get("caption") or "Figure"
                    yield {
                        "course_id": course_id,
                        "source_id": source_id,
                        "text": str(figure_text),
                        "visual": visual,
                        "page": page_number,
                        "modality": "figure",
                        "bbox": [rect.x0, rect.y0, rect.x1, rect.y1],
                        "extraction_confidence": 0.6 if visual.get("warning") else 0.9,
                    }
            except Exception as exc:
                logger.exception("Skipping failed PDF page %d: %s", page_number, exc)
    finally:
        document.close()
