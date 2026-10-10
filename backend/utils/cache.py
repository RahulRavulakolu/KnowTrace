"""Disk cache helpers for KnowTrace LLM responses.

Uses diskcache for persistent SHA256-keyed caching of LLM call results.
Cache is stored at the path specified by settings.LLM_CACHE_DIR.
"""

import hashlib
import json
from pathlib import Path
from typing import Any, Optional

import diskcache

from backend.core.config import settings
from backend.core.logging import logger

# Lazy singleton — initialized on first access
_cache: Optional[diskcache.Cache] = None


def _get_cache() -> diskcache.Cache:
    """Return the singleton diskcache.Cache instance, creating it if needed."""
    global _cache
    if _cache is None:
        cache_dir = Path(settings.LLM_CACHE_DIR)
        cache_dir.mkdir(parents=True, exist_ok=True)
        _cache = diskcache.Cache(
            str(cache_dir),
            size_limit=settings.LLM_CACHE_SIZE_LIMIT,
        )
        logger.info("LLM disk cache initialized at %s (limit=%d bytes)",
                     cache_dir, settings.LLM_CACHE_SIZE_LIMIT)
    return _cache


def make_cache_key(vendor: str, prompt: str, json_schema: Any = None) -> str:
    """Generate a deterministic SHA256 cache key from call parameters.

    Args:
        vendor: LLM vendor identifier.
        prompt: The prompt text.
        json_schema: Optional schema (Pydantic class or dict) for structured output.

    Returns:
        Hex-encoded SHA256 hash string.
    """
    schema_str = ""
    if json_schema is not None:
        if hasattr(json_schema, "model_json_schema"):
            schema_str = json.dumps(json_schema.model_json_schema(), sort_keys=True)
        elif isinstance(json_schema, dict):
            schema_str = json.dumps(json_schema, sort_keys=True)
        else:
            schema_str = str(json_schema)

    payload = f"{vendor}::{prompt}::{schema_str}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def cache_get(key: str) -> Optional[str]:
    """Retrieve a cached LLM response by key.

    Returns:
        The cached response string, or None on miss.
    """
    if not settings.LLM_CACHE_ENABLED:
        return None
    cache = _get_cache()
    result = cache.get(key)
    if result is not None:
        logger.info("LLM cache HIT key=%s…", key[:12])
    else:
        logger.info("LLM cache MISS key=%s…", key[:12])
    return result  # type: ignore[return-value]


def cache_set(key: str, value: str) -> None:
    """Store an LLM response in the disk cache.

    Args:
        key: SHA256 cache key.
        value: The raw response string to cache.
    """
    if not settings.LLM_CACHE_ENABLED:
        return
    cache = _get_cache()
    cache.set(key, value)
    logger.info("LLM cache SET key=%s…", key[:12])


def cache_clear() -> None:
    """Clear the entire LLM disk cache."""
    cache = _get_cache()
    cache.clear()
    logger.info("LLM disk cache cleared")
