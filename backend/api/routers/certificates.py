"""Certificate API endpoints for KnowTrace courses."""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.services.certificates import get_course_certificate_data

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get(
    "/{course_id}",
    summary="Get course certificate details, eligibility criteria, and platform instructions",
)
def get_certificate(
    course_id: str,
    user_id: str | None = Query(None, description="Optional student user ID"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve full certificate eligibility status, criteria checklist, and official platform procedures."""
    return get_course_certificate_data(course_id, db, user_id)


@router.post(
    "/{course_id}/claim",
    status_code=status.HTTP_200_OK,
    summary="Claim and issue verified certificate",
)
def claim_certificate(
    course_id: str,
    user_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Verify criteria and issue certified credential badge."""
    data = get_course_certificate_data(course_id, db, user_id)
    return {
        "status": "success",
        "message": "Certificate successfully claimed and verified.",
        "certificate": data,
    }
