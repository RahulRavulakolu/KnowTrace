"""Structured logging system with Request ID propagation across async contexts.

Ensures traceable logs for debugging, audit trails, and multi-tenant observability.
"""

import logging
import sys
from contextvars import ContextVar
from typing import Optional
import uuid

# Context variable storing the current request ID
_request_id_ctx_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def get_request_id() -> Optional[str]:
    """Retrieve the current context's request ID."""
    return _request_id_ctx_var.get()


def set_request_id(request_id: Optional[str] = None) -> str:
    """Set or generate a new request ID for the current context."""
    req_id = request_id or str(uuid.uuid4())
    _request_id_ctx_var.set(req_id)
    return req_id


class RequestIdFilter(logging.Filter):
    """Logging filter that injects the current request ID into log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        req_id = get_request_id()
        record.request_id = req_id if req_id else "system"
        return True


def setup_logging(level: int = logging.INFO) -> None:
    """Configure root logger with structured formatting and request ID injection."""
    log_format = (
        "[%(asctime)s] [%(levelname)s] [req_id=%(request_id)s] "
        "[%(name)s:%(funcName)s:%(lineno)d] - %(message)s"
    )

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if setup_logging is invoked multiple times
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(log_format, datefmt="%Y-%m-%d %H:%M:%S"))
        handler.addFilter(RequestIdFilter())
        root_logger.addHandler(handler)
    else:
        for handler in root_logger.handlers:
            handler.setFormatter(logging.Formatter(log_format, datefmt="%Y-%m-%d %H:%M:%S"))
            handler.addFilter(RequestIdFilter())


logger = logging.getLogger("knowtrace")
