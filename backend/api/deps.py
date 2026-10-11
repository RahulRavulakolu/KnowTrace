"""FastAPI Dependency Injection Providers."""

from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from backend.core.db import get_db


def get_session(db: Session = Depends(get_db)) -> Generator[Session, None, None]:
    """Provide transactional database session."""
    yield db
