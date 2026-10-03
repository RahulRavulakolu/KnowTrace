"""Integration tests for FastAPI application endpoints and Request-ID middleware."""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Verify root index endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "KnowTrace"
    assert "docs" in data


def test_ping_endpoint(client: TestClient):
    """Verify /api/v1/ping endpoint."""
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"message": "pong"}


def test_health_check_endpoint(client: TestClient):
    """Verify /api/v1/health returns structured HealthResponse with db connection status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["app_name"] == "KnowTrace"
    assert "database" in data
    assert "redis" in data
    assert "timestamp" in data


def test_request_id_header_injected(client: TestClient):
    """Verify X-Request-ID header is generated and returned by middleware."""
    response = client.get("/api/v1/ping")
    assert "X-Request-ID" in response.headers
    req_id = response.headers["X-Request-ID"]
    assert len(req_id) > 10


def test_custom_request_id_propagated(client: TestClient):
    """Verify custom X-Request-ID provided by client is preserved."""
    custom_id = "custom-client-trace-777"
    response = client.get("/api/v1/ping", headers={"X-Request-ID": custom_id})
    assert response.headers.get("X-Request-ID") == custom_id
