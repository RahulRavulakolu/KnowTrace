"""Curated multi-week lecture catalogs with 100% verified playable YouTube embeds.

Loaded dynamically from backend/data/catalogs/ JSON datasets.
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


MIT_6006_ALGORITHMS_LECTURES: List[Dict[str, Any]] = _load_catalog("mit_6006_algorithms.json")
NPTEL_ML_LECTURES: List[Dict[str, Any]] = _load_catalog("nptel_ml.json")
MITX_PYTHON_LECTURES: List[Dict[str, Any]] = _load_catalog("mitx_python.json")
SWAYAM_DS_LECTURES: List[Dict[str, Any]] = _load_catalog("swayam_ds.json")
KHAN_ACADEMY_LA_LECTURES: List[Dict[str, Any]] = _load_catalog("khan_academy_la.json")

__all__ = [
    "MIT_6006_ALGORITHMS_LECTURES",
    "NPTEL_ML_LECTURES",
    "MITX_PYTHON_LECTURES",
    "SWAYAM_DS_LECTURES",
    "KHAN_ACADEMY_LA_LECTURES",
]
