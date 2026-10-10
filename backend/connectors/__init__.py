"""Multi-platform course source connectors for KnowTrace.

Provides a unified interface for discovering and retrieving course information
from multiple educational platforms (NPTEL, SWAYAM, MIT OCW, MITx, etc.).
"""

from backend.connectors.base import (
    AccessType,
    CatalogCourseData,
    CourseModuleData,
    CourseResourceData,
    CourseSourceConnector,
    SourcePlatform,
)
from backend.connectors.registry import ConnectorRegistry

__all__ = [
    "AccessType",
    "CatalogCourseData",
    "CourseModuleData",
    "CourseResourceData",
    "CourseSourceConnector",
    "ConnectorRegistry",
    "SourcePlatform",
]
