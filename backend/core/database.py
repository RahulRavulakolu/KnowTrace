"""Re-export database module for backward compatibility."""

from backend.core.db import Base, SessionLocal, engine, get_db

__all__ = ["Base", "SessionLocal", "engine", "get_db"]
