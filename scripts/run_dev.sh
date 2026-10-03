#!/usr/bin/env bash
set -e

SERVICE=${1:-backend}
export PYTHONPATH="."

case "$SERVICE" in
  backend)
    echo "Starting KnowTrace FastAPI Backend on http://localhost:8000..."
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
    ;;
  worker)
    echo "Starting KnowTrace RQ Background Worker..."
    rq worker default ingestion assessments
    ;;
  docker)
    echo "Spinning up Docker Compose environment..."
    docker-compose -f docker/docker-compose.yml up --build
    ;;
  seed)
    echo "Seeding database..."
    python scripts/seed_db.py
    ;;
  *)
    echo "Usage: ./scripts/run_dev.sh [backend|worker|docker|seed]"
    exit 1
    ;;
esac
