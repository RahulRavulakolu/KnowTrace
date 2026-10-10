"""SQLAlchemy database session management and engine for KnowTrace.

Provides:
- Engine with connection pooling
- Declarative Base for ORM models
- Session factory and FastAPI dependency injection
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from backend.core.config import settings

# Declarative Base for all ORM models
Base = declarative_base()

# Engine configuration
_engine_kwargs: dict = {
    "echo": False,
    "future": True,
}

if "sqlite" in settings.DATABASE_URL:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    _engine_kwargs["pool_size"] = 10
    _engine_kwargs["max_overflow"] = 20
    _engine_kwargs["pool_pre_ping"] = True

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a transactional database session.

    Automatically rolls back on error and always closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
