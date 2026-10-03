"""API V1 Route Definitions for KnowTrace."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.database import get_db
from backend.core.logging import logger
from backend.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="System Health Status")
def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """Verifies backend application, database connectivity, and configuration."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Health check database probe failed: %s", exc)
        db_status = f"error: {str(exc)}"

    redis_status = "unconfigured"
    if settings.REDIS_URL:
        try:
            import redis
            r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
            r.ping()
            redis_status = "connected"
        except Exception as exc:
            logger.warning("Redis ping failed in health check: %s", exc)
            redis_status = f"unavailable: {exc}"

    return HealthResponse(
        status="healthy" if "error" not in db_status else "degraded",
        app_name=settings.APP_NAME,
        app_env=settings.APP_ENV,
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
        database=db_status,
        redis=redis_status,
    )


@router.get("/ping", summary="Liveness ping")
def ping() -> dict:
    """Returns a simple pong to verify HTTP reachability."""
    return {"message": "pong"}
