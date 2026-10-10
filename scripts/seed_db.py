"""Database Seed Script for KnowTrace Development Environment.

Calls database.seed.seed_database() to populate demo course, concepts, and provenance chunks.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.seed import seed_database

if __name__ == "__main__":
    seed_database()
