"""Common Pydantic Schemas for KnowTrace."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """System health check payload."""

    status: str = Field(default="healthy", description="Application health status")
    app_name: str = Field(description="Name of the running application")
    app_env: str = Field(description="Deployment environment")
    version: str = Field(default="0.1.0", description="Semver release")
    timestamp: datetime = Field(description="Current UTC timestamp")
    database: str = Field(default="connected", description="Database connection health")
    redis: str = Field(default="connected", description="Redis connection health")


class ProvenanceAnchorSchema(BaseModel):
    """Schema representing an exact provenance anchor.

    Rule 1: Provenance spine: every chunk stores source_id + page|slide|ts_start/ts_end (+ bbox for figures)
    """

    source_id: str = Field(..., description="UUID of the parent source document/media")
    page_number: Optional[int] = Field(None, description="1-based page number for PDF books")
    slide_number: Optional[int] = Field(None, description="1-based slide index for PPTX decks")
    ts_start: Optional[float] = Field(None, description="Video start timestamp in seconds")
    ts_end: Optional[float] = Field(None, description="Video end timestamp in seconds")
    bbox: Optional[Dict[str, float]] = Field(
        None, description="Bounding box [x0, y0, x1, y1] for figures/tables"
    )


class ContentChunkBase(BaseModel):
    """Base schema for a content chunk with full provenance."""

    source_id: str
    chunk_type: str
    content: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    ts_start: Optional[float] = None
    ts_end: Optional[float] = None
    bbox: Optional[Dict[str, Any]] = None
    image_path: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class LLMValidationResult(BaseModel):
    """Structured validation output schema used by Vendor B."""

    is_valid: bool = Field(
        ..., description="Whether the generated artifact satisfies all rubric criteria"
    )
    status: str = Field(..., description="'approved' or 'rejected'")
    score: float = Field(
        ..., ge=0.0, le=1.0, description="Quality/Fidelity score between 0.0 and 1.0"
    )
    feedback: str = Field(..., description="Detailed critique and suggestions")
    identified_issues: List[str] = Field(
        default_factory=list, description="Specific defects or hallucinations"
    )
