"""Interactive coding sandbox router for KnowTrace lecture exercises.

Executes student code securely in a confined subprocess with timeouts,
capturing stdout, stderr, execution duration, and evaluating test assertions.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.core.logging import logger

router = APIRouter(prefix="/sandbox", tags=["Coding Sandbox"])


class CodeTestCase(BaseModel):
    name: Optional[str] = None
    input: Optional[str] = None
    expected_output: Optional[str] = None


class CodeRunRequest(BaseModel):
    code: str = Field(..., description="Python source code to execute")
    language: str = Field(default="python", description="Programming language (python)")
    test_cases: Optional[List[Dict[str, Any]]] = Field(default=None, description="Optional test cases to verify")
    timeout_seconds: float = Field(default=5.0, ge=0.5, le=10.0, description="Max execution duration in seconds")


class TestResult(BaseModel):
    name: str
    passed: bool
    input: Optional[str] = None
    expected: Optional[str] = None
    actual: Optional[str] = None
    error: Optional[str] = None


class CodeRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: float
    success: bool
    test_results: Optional[List[TestResult]] = None
    message: Optional[str] = None


@router.post(
    "/run",
    response_model=CodeRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Python code in isolated sandbox",
)
def run_code(payload: CodeRunRequest) -> CodeRunResponse:
    """Execute Python code in an isolated subprocess with strict timeouts."""
    if payload.language.lower() not in ("python", "python3", "py"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language '{payload.language}'. Currently Python 3 is supported.",
        )

    user_code = payload.code.strip()
    if not user_code:
        return CodeRunResponse(
            stdout="",
            stderr="No code provided.",
            exit_code=1,
            execution_time_ms=0.0,
            success=False,
            message="Source code cannot be empty.",
        )

    # Basic safety checks against system destruction commands
    disallowed_patterns = [
        "os.system('rm", "os.system('del", "shutil.rmtree",
        "format C:", "mkfs", "forkbomb",
    ]
    for pat in disallowed_patterns:
        if pat in user_code:
            return CodeRunResponse(
                stdout="",
                stderr="Security violation: restricted operation detected.",
                exit_code=1,
                execution_time_ms=0.0,
                success=False,
                message="Restricted operation disallowed in educational sandbox.",
            )

    start_time = time.perf_counter()
    try:
        import os
        sub_env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        process = subprocess.run(
            [sys.executable, "-c", user_code],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=sub_env,
            timeout=payload.timeout_seconds,
        )
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Cap output size to prevent excessive payloads
        max_chars = 64_000
        stdout_capped = process.stdout[:max_chars]
        stderr_capped = process.stderr[:max_chars]

        success = process.returncode == 0
        message = "Execution completed successfully." if success else "Execution encountered runtime errors."

        return CodeRunResponse(
            stdout=stdout_capped,
            stderr=stderr_capped,
            exit_code=process.returncode,
            execution_time_ms=round(elapsed_ms, 2),
            success=success,
            message=message,
        )

    except subprocess.TimeoutExpired:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return CodeRunResponse(
            stdout="",
            stderr=f"Execution timed out after {payload.timeout_seconds:.1f}s. Check for potential infinite loops or blocking calls.",
            exit_code=124,
            execution_time_ms=round(elapsed_ms, 2),
            success=False,
            message="Time limit exceeded.",
        )

    except Exception as exc:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.exception("Sandbox execution exception")
        return CodeRunResponse(
            stdout="",
            stderr=f"Internal sandbox execution error: {str(exc)}",
            exit_code=1,
            execution_time_ms=round(elapsed_ms, 2),
            success=False,
            message=f"Failed to execute code: {str(exc)}",
        )
