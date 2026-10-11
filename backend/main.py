"""Main FastAPI Application Entrypoint for KnowTrace.

Configures:
- Request ID middleware for distributed tracing (X-Request-ID header on all responses)
- CORS middleware (allowing all origins for dev)
- Database schema initialization
- Health check endpoints
- Course API routes
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router as system_router
from backend.api.routers.courses import router as courses_router
from backend.api.routers.concepts import router as concepts_router
from backend.api.routers.chat import router as chat_router
from backend.api.routers.learner import router as learner_router
from backend.api.routers.questions import router as questions_router
from backend.api.routers.assessments import router as assessments_router
from backend.api.routers.misconceptions import router as misconceptions_router
from backend.api.routers.graph import router as graph_router
from backend.api.routers.discover import router as discover_router
from backend.api.routers.sandbox import router as sandbox_router
from backend.api.routers.certificates import router as certificates_router
from backend.core.config import settings
from backend.core.db import Base, engine
from backend.core.logging import RequestIdMiddleware, logger, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler for startup and shutdown procedures."""
    setup_logging()
    logger.info("Initializing %s (Env: %s, Version: %s)",
                settings.APP_NAME, settings.APP_ENV, settings.VERSION)

    # In local development or SQLite environments, initialize tables
    if settings.APP_ENV in ("development", "test") or "sqlite" in settings.DATABASE_URL:
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database schemas verified / tables initialized successfully.")
        except Exception:
            logger.exception("Database schema initialization failed.")
            raise
    else:
        logger.info("Production mode: relying on external Alembic migrations.")

    yield

    logger.info("Shutting down %s...", settings.APP_NAME)


def create_app() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="KnowTrace: Source-Anchored Adaptive AI Tutor",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # 1. Request ID Middleware (propagates X-Request-ID to all responses)
    app.add_middleware(RequestIdMiddleware)

    # 2. CORS Middleware
    origins = [str(o).rstrip("/") for o in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else []
    if settings.DEBUG:
        origins = list(set(origins + ["http://localhost:3000", "http://127.0.0.1:3000"]))
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins else ["*"],
        allow_credentials=bool(origins and "*" not in origins),
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Health Check endpoint
    @app.get("/health", summary="Health check", tags=["System"])
    def health_check() -> Dict[str, str]:
        """Health check returning status and API version."""
        return {
            "status": "ok",
            "version": settings.VERSION,
        }

    # 4. Root information
    @app.get("/", summary="Root endpoint", tags=["System"])
    def root() -> Dict[str, str]:
        """Root endpoint returning system overview."""
        return {
            "app": settings.APP_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs": "/docs",
        }

    # 5. Include feature routers at /api/v1 (and root aliases for test compatibility)
    feature_routers = [
        courses_router,
        concepts_router,
        chat_router,
        learner_router,
        questions_router,
        assessments_router,
        misconceptions_router,
        graph_router,
        discover_router,
        sandbox_router,
        certificates_router,
    ]
    for r in feature_routers:
        app.include_router(r)
        app.include_router(r, prefix=settings.API_V1_STR)
    app.include_router(system_router, prefix=settings.API_V1_STR)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
