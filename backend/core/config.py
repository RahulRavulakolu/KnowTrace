"""KnowTrace Application Configuration Module.

Loads and validates environment settings using Pydantic Settings.
Follows the Twelve-Factor App methodology.
"""

from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings schema with sensible defaults and environment overrides."""

    # Project metadata
    APP_NAME: str = "KnowTrace"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # PostgreSQL & pgvector Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "knowtrace"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/knowtrace"
    ASYNC_DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/knowtrace"

    # Redis & RQ Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # LLM Vendors
    # Vendor A = Gemini (Generation & Vision)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # Vendor B = Claude / Groq (Validation & Quality Control)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"

    # Embeddings & Hybrid Search
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    RERANKER_MODEL: str = "BAAI/bge-reranker-v2-m3"
    VECTOR_DIMENSION: int = 1024

    # Security & CORS
    SECRET_KEY: str = "dev_secret_key_change_in_production_32chars"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Storage Paths
    UPLOAD_DIR: str = "./uploads"
    STORAGE_BACKEND: str = "local"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
