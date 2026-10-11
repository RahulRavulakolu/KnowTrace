"""FastAPI Dependency Providers for database sessions and authentication."""

from collections.abc import Generator
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.core.security import decode_access_token
from backend.models.db import User

security_bearer = HTTPBearer(auto_error=False)


def get_session(db: Session = Depends(get_db)) -> Generator[Session, None, None]:
    """Provide transactional database session."""
    yield db


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Validate Bearer JWT token and return authenticated User."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = decode_access_token(auth.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )
    return user


def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Return authenticated User if valid Bearer token provided, otherwise None."""
    if not auth or not auth.credentials:
        return None
    user_id = decode_access_token(auth.credentials)
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()
