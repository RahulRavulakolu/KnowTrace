"""Robust file-type detection for uploaded learning materials."""

from pathlib import Path
from typing import Literal

try:
    import magic
except ImportError:  # pragma: no cover - Docker installs python-magic
    magic = None  # type: ignore[assignment]

FileType = Literal["pdf", "pptx", "video", "image"]

_EXTENSIONS: dict[str, FileType] = {
    ".pdf": "pdf",
    ".pptx": "pptx",
    ".mp4": "video",
    ".mov": "video",
    ".avi": "video",
    ".mkv": "video",
    ".webm": "video",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".webp": "image",
}


def detect_file_type(file_bytes: bytes, filename: str | None = None) -> FileType:
    """Detect a supported upload type using content signatures and extension."""
    if not file_bytes:
        raise ValueError("Cannot classify an empty file")

    mime = magic.from_buffer(file_bytes, mime=True).lower() if magic else ""
    extension_type = _EXTENSIONS.get(Path(filename or "").suffix.lower())
    if mime == "application/pdf" or file_bytes.startswith(b"%PDF"):
        return "pdf"
    if (
        mime
        in {
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/zip",
        }
        and extension_type == "pptx"
    ):
        return "pptx"
    if mime.startswith("video/") or extension_type == "video":
        return "video"
    if mime.startswith("image/") or extension_type == "image":
        return "image"
    if extension_type == "pptx":
        return "pptx"
    raise ValueError(f"Unsupported or unrecognized file type: {filename or mime}")
