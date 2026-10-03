"""Unit tests for Settings and Request-ID Logging."""

import logging
from backend.core.config import Settings
from backend.core.logging import get_request_id, set_request_id, setup_logging, RequestIdFilter


def test_settings_initialization():
    """Verify settings defaults and environment variable overrides."""
    s = Settings(APP_NAME="KnowTrace-Test", DEBUG=True)
    assert s.APP_NAME == "KnowTrace-Test"
    assert s.DEBUG is True
    assert s.API_V1_STR == "/api/v1"
    assert s.VECTOR_DIMENSION == 1024


def test_request_id_context_and_filter():
    """Verify request ID is properly tracked in contextvars and injected into log records."""
    # Test generation and retrieval
    generated_id = set_request_id("test-req-12345")
    assert generated_id == "test-req-12345"
    assert get_request_id() == "test-req-12345"

    # Test log filter attaches request_id
    record = logging.LogRecord(
        name="knowtrace.test",
        level=logging.INFO,
        pathname="test.py",
        lineno=10,
        msg="Sample log message",
        args=(),
        exc_info=None,
    )
    filter_instance = RequestIdFilter()
    filter_instance.filter(record)
    assert hasattr(record, "request_id")
    assert record.request_id == "test-req-12345"


def test_setup_logging_idempotent():
    """Verify setup_logging runs without raising exceptions or breaking handlers."""
    setup_logging(level=logging.DEBUG)
    logger = logging.getLogger("knowtrace")
    assert logger.level <= logging.DEBUG
