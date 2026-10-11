"""Authentication router for signup, login, and user profiles."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.api.deps import get_current_user, get_session
from backend.core.security import create_access_token, hash_password, verify_password
from backend.models.db import User
from backend.schemas.auth import TokenResponse, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_session)) -> TokenResponse:
    """Create a new user account with hashed password and return access token."""
    email_clean = data.email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = User(
        email=email_clean,
        name=data.name.strip() if data.name else None,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_session)) -> TokenResponse:
    """Verify credentials and return JWT bearer token."""
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_current_user_profile(user: User = Depends(get_current_user)) -> UserOut:
    """Return currently authenticated user account profile."""
    return UserOut.model_validate(user)
