"""Pydantic schemas for authentication and user accounts."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserRegister(BaseModel):
    """User account creation payload."""

    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=100)
    name: Optional[str] = Field(None, max_length=255)


class UserLogin(BaseModel):
    """User authentication payload."""

    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    """Public user profile response."""

    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """JWT Bearer token and user summary."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut
