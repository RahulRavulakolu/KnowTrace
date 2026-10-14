"""Certificate API endpoints for KnowTrace courses."""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.api.deps import get_optional_user
from backend.core.db import get_db
from backend.models.db import User
from backend.services.certificates import get_course_certificate_data

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get(
    "/{course_id}",
    summary="Get course certificate details, eligibility criteria, and platform instructions",
)
def get_certificate(
    course_id: str,
    user_id: str | None = Query(None, description="Optional student user ID"),
    lectures_completed_pct: float | None = Query(
        None, description="Actual completed lectures percentage"
    ),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve full certificate eligibility status, criteria checklist, and official platform procedures."""
    effective_user_id = user_id or (current_user.id if current_user else None)
    return get_course_certificate_data(course_id, db, effective_user_id, lectures_completed_pct)


@router.post(
    "/{course_id}/claim",
    status_code=status.HTTP_200_OK,
    summary="Claim and issue verified certificate",
)
def claim_certificate(
    course_id: str,
    user_id: str | None = Query(None),
    lectures_completed_pct: float | None = Query(
        None, description="Actual completed lectures percentage"
    ),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Verify criteria and issue certified credential badge."""
    effective_user_id = user_id or (current_user.id if current_user else None)
    data = get_course_certificate_data(course_id, db, effective_user_id, lectures_completed_pct)
    if not data.get("is_eligible", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course requirements not met. You must complete at least 80% of syllabus lectures before claiming your certificate.",
        )
    return {
        "status": "success",
        "message": "Certificate successfully claimed and verified.",
        "certificate": data,
    }
