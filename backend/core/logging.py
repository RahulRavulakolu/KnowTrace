"""Structured logging with Request-ID propagation for KnowTrace.

Provides:
- ContextVar-based request ID tracking
- Log filter that injects request_id into every log record
- FastAPI middleware for automatic request ID assignment
"""

import logging
import sys
import uuid
from contextvars import ContextVar
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# ─── Context Variable ────────────────────────────────────────
_request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def get_request_id() -> Optional[str]:
    """Return the current request ID from context."""
    return _request_id_ctx.get()


def set_request_id(request_id: Optional[str] = None) -> str:
    """Set or generate a request ID for the current context."""
    rid = request_id or str(uuid.uuid4())
    _request_id_ctx.set(rid)
    return rid


# ─── Log Filter ──────────────────────────────────────────────
class RequestIdFilter(logging.Filter):
    """Injects request_id into log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id() or "system"  # type: ignore[attr-defined]
        return True


# ─── Logger Setup ────────────────────────────────────────────
def setup_logging(level: int = logging.INFO) -> None:
    """Configure root logger with structured formatting and request ID."""
    fmt = (
        "[%(asctime)s] [%(levelname)s] [req=%(request_id)s] "
        "[%(name)s:%(funcName)s:%(lineno)d] %(message)s"
    )
    root = logging.getLogger()
    root.setLevel(level)

    if not root.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%d %H:%M:%S"))
        handler.addFilter(RequestIdFilter())
        root.addHandler(handler)
    else:
        for h in root.handlers:
            h.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%d %H:%M:%S"))
            if not any(isinstance(f, RequestIdFilter) for f in h.filters):
                h.addFilter(RequestIdFilter())


logger = logging.getLogger("knowtrace")


# ─── FastAPI Middleware ──────────────────────────────────────
class RequestIdMiddleware(BaseHTTPMiddleware):
    """Middleware that assigns or propagates X-Request-ID on every request."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get("X-Request-ID")
        rid = set_request_id(incoming_id)
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        return response
