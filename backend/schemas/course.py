"""Pydantic schemas for Course operations."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CourseCreate(BaseModel):
    """Schema for creating a course."""
    title: str = Field(..., min_length=1, max_length=500, description="Course title")
    exam_date: Optional[date] = Field(None, description="Target exam date")
    hours_per_day: float = Field(2.0, ge=0.1, le=24.0, description="Planned study hours per day")
    owner_id: Optional[str] = Field(None, description="Optional owner ID; defaults to default student")


class CourseCreateResponse(BaseModel):
    """Response returned upon successful course creation."""
    course_id: str = Field(..., description="ID of created course")


class CourseResponse(BaseModel):
    """Full course details response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    title: str
    exam_date: Optional[date] = None
    hours_per_day: float = 2.0
    created_at: datetime
    source_platform: Optional[str] = None
    source_id: Optional[str] = None
    instructor: Optional[str] = None
    institution: Optional[str] = None
    category: Optional[str] = None
    certificate_available: bool = False
