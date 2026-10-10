#!/usr/bin/env bash
# ============================================================
# KnowTrace Environment Setup Script
# ============================================================
set -euo pipefail

echo "=============================================="
echo " Setting up KnowTrace: Source-Anchored Tutor  "
echo "=============================================="

# 1. Check Python version
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "[1/5] Checking Python..."
$PYTHON_CMD --version

# 2. Check or create .env
if [ ! -f ".env" ]; then
    echo "[2/5] Creating .env from .env.example..."
    cp .env.example .env
    echo "  -> .env created. Please review API keys."
else
    echo "[2/5] .env file already exists."
fi

# 3. Create required runtime directories
echo "[3/5] Creating runtime directories..."
mkdir -p uploads logs data/cache

# 4. Virtual environment
if [ ! -d ".venv" ]; then
    echo "[4/5] Creating Python virtual environment..."
    $PYTHON_CMD -m venv .venv
fi

# Activate virtual environment
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
fi

echo "Installing/updating dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 5. Verification
echo "[5/5] Running Phase 1 test suite..."
pytest tests/test_phase_1.py -v

echo ""
echo "=============================================="
echo " KnowTrace Phase 1 Setup Complete!            "
echo "=============================================="
echo "To start services locally:"
echo "  uvicorn backend.main:app --reload --port 8000"
echo ""
echo "Or using Docker Compose:"
echo "  docker-compose up -d"
echo "  docker-compose exec api pytest tests/test_phase_1.py -v"
echo "=============================================="
