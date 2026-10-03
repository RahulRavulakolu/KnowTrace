"""Database session management and engine initialization for KnowTrace.

Uses SQLAlchemy 2.0 with connection pooling, declarative base, and session generators.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.core.config import settings
from backend.core.logging import logger

# Create SQLAlchemy Base for all models
Base = declarative_base()

# Configure engine with pooling
engine_args = {
    "echo": False,
    "future": True,
}

if "sqlite" in settings.DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20
    engine_args["pool_pre_ping"] = True

engine = create_engine(settings.DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency generator that provides a transactional SQLAlchemy session per request."""
    db: Session = SessionLocal()
    try:
        yield db
    except Exception as exc:
        logger.error("Database session rolled back due to error: %s", exc)
        db.rollback()
        raise
    finally:
        db.close()
