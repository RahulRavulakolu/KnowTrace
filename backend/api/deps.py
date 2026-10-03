"""FastAPI Dependency Injection Providers."""

from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db


def get_session(db: Session = Depends(get_db)) -> Generator[Session, None, None]:
    """Provide transactional database session."""
    yield db
