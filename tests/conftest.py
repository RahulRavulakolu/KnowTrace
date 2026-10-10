"""Pytest Configuration and Fixtures for KnowTrace."""

import os
import sys

# Force test configuration in environment before importing app modules
os.environ["APP_ENV"] = "test"
os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GEMINI_API_KEY"] = "mock-gemini-test-key"
os.environ["GROQ_API_KEY"] = "mock-groq-test-key"
os.environ["REDIS_URL"] = ""
os.environ["LLM_CACHE_DIR"] = "data/test_cache"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure root directory is accessible for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.core.db import Base, get_db
# Import all models to register them on Base.metadata
import backend.models.db  # noqa: F401
from backend.main import create_app
from backend.utils.cache import cache_clear

# SQLite in-memory test engine
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
    expire_on_commit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all schema tables for in-memory testing."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(autouse=True)
def clear_cache_fixture():
    """Clear LLM cache before each test."""
    cache_clear()
    yield
    cache_clear()


@pytest.fixture
def db_session() -> Session:
    """Provide a clean database session per test with rollback."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> TestClient:
    """FastAPI TestClient with overridden get_db dependency."""
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
