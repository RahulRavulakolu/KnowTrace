"""KnowTrace Application Configuration.

Loads settings from environment variables and .env files using Pydantic Settings.
Validates required configuration on import.
"""

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable overrides and validation."""

    # ─── Application ────────────────────────────────────
    APP_NAME: str = "KnowTrace"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    VERSION: str = "1.0.0"

    # ─── PostgreSQL + pgvector ──────────────────────────
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "knowtrace"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/knowtrace"

    # ─── Redis & RQ ────────────────────────────────────
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── LLM Providers ─────────────────────────────────
    # Vendor A: Gemini (generation, vision, long context)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    # Vendor B: Groq / Claude (validation, grading, judging)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-haiku-20240307"

    # ─── LLM Cache ─────────────────────────────────────
    LLM_CACHE_DIR: str = "data/cache"
    LLM_CACHE_SIZE_LIMIT: int = 1_073_741_824  # 1 GB
    LLM_CACHE_ENABLED: bool = True

    # ─── Embeddings & Retrieval ────────────────────────
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    RERANKER_MODEL: str = "BAAI/bge-reranker-v2-m3"
    VECTOR_DIMENSION: int = 1024

    # ─── Security / CORS ───────────────────────────────
    SECRET_KEY: str = "dev_secret_key_change_in_production_32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    DATA_DIR: str = "./data"
    CACHE_DIR: str = "./data/cache"
    BGE_MODEL: str = "BAAI/bge-m3"
    CHUNK_SIZE: int = 350
    BATCH_SIZE: int = 32
    ASR_MODEL: str = "small"
    ASR_COMPUTE_TYPE: str = "int8"
    SCENE_THRESHOLD: float = 27.0
    MAX_FRAMES: int = 60
    MAX_VIDEO_DURATION: int = 1800

    # ─── File Storage ──────────────────────────────────
    UPLOAD_DIR: str = "./uploads"
    STORAGE_BACKEND: str = "local"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
