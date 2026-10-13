"""KnowTrace Core Package."""

from typing import TYPE_CHECKING

from backend.core.config import settings
from backend.core.db import Base, SessionLocal, engine, get_db
from backend.core.logging import get_request_id, logger, set_request_id, setup_logging

if TYPE_CHECKING:
    from backend.core.llm import LLMResponse, call_llm


def __getattr__(name: str):
    if name in ("LLMResponse", "call_llm"):
        import backend.core.llm as _llm
        return getattr(_llm, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    "settings",
    "Base",
    "SessionLocal",
    "engine",
    "get_db",
    "LLMResponse",
    "call_llm",
    "logger",
    "setup_logging",
    "get_request_id",
    "set_request_id",
]
