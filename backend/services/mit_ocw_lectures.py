"""Curated lecture catalog for MIT OCW 6.042 Mathematics for Computer Science.

Loaded dynamically from backend/data/catalogs/mit_ocw_6042.json.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

_CATALOG_DIR = Path(__file__).resolve().parent.parent / "data" / "catalogs"


def _load_catalog(filename: str) -> List[Dict[str, Any]]:
    """Load JSON catalog data from disk."""
    path = _CATALOG_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


MIT_OCW_LECTURES: List[Dict[str, Any]] = _load_catalog("mit_ocw_6042.json")

__all__ = ["MIT_OCW_LECTURES"]
