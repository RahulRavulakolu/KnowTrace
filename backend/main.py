"""Main FastAPI Application Entrypoint for KnowTrace.

Configures:
- Request ID middleware for distributed tracing
- CORS middleware
- Application lifespan events
- API route mounting under /api/v1
"""

import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.routes import router as api_router
from backend.core.config import settings
from backend.core.database import Base, engine
from backend.core.logging import logger, set_request_id, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler for startup and shutdown procedures."""
    setup_logging()
    logger.info("Initializing KnowTrace Application (Environment: %s)", settings.APP_ENV)

    # In local development or testing with sqlite, create tables if they do not exist
    if "sqlite" in settings.DATABASE_URL or settings.APP_ENV == "development":
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database schemas verified / tables initialized.")
        except Exception as exc:
            logger.warning("Auto table initialization skipped or encountered notice: %s", exc)

    yield

    logger.info("Shutting down KnowTrace Application...")


def create_app() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        description="KnowTrace: Source-Anchored Adaptive Tutor Backend",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID and Access Logging Middleware
    @app.middleware("http")
    async def request_id_and_logging_middleware(request: Request, call_next) -> Response:
        incoming_req_id = request.headers.get("X-Request-ID")
        req_id = set_request_id(incoming_req_id or str(uuid.uuid4()))

        start_time = time.perf_counter()
        logger.info("Started %s '%s'", request.method, request.url.path)

        try:
            response: Response = await call_next(request)
            process_time_ms = (time.perf_counter() - start_time) * 1000
            response.headers["X-Request-ID"] = req_id
            logger.info("Completed %s '%s' status=%d duration=%.2fms",
                        request.method, request.url.path, response.status_code, process_time_ms)
            return response
        except Exception as exc:
            process_time_ms = (time.perf_counter() - start_time) * 1000
            logger.error("Unhandled error processing %s '%s' duration=%.2fms: %s",
                         request.method, request.url.path, process_time_ms, exc, exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal Server Error",
                    "request_id": req_id,
                },
                headers={"X-Request-ID": req_id},
            )

    # Mount API routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", summary="Root index")
    def root():
        return {
            "app": settings.APP_NAME,
            "version": "0.1.0",
            "docs": "/docs",
            "api_v1": settings.API_V1_STR,
        }

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
