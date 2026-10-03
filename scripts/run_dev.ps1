# KnowTrace Local Development Runner (PowerShell)
param(
    [string]$Service = "backend"
)

$env:PYTHONPATH = "."
$env:TEMP = "$PSScriptRoot\..\.temp"
$env:TMP = "$PSScriptRoot\..\.temp"

if ($Service -eq "backend") {
    Write-Host "Starting KnowTrace FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
    .\.venv\Scripts\uvicorn.exe backend.main:app --host 0.0.0.0 --port 8000 --reload
} elseif ($Service -eq "worker") {
    Write-Host "Starting KnowTrace RQ Background Worker..." -ForegroundColor Cyan
    .\.venv\Scripts\rq.exe worker default ingestion assessments
} elseif ($Service -eq "docker") {
    Write-Host "Spinning up Docker Compose environment..." -ForegroundColor Cyan
    docker-compose -f docker/docker-compose.yml up --build
} elseif ($Service -eq "seed") {
    Write-Host "Seeding database..." -ForegroundColor Cyan
    .\.venv\Scripts\python.exe scripts/seed_db.py
} else {
    Write-Host "Usage: .\scripts\run_dev.ps1 [-Service backend|worker|docker|seed]" -ForegroundColor Yellow
}
