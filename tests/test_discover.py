"""Unit and integration tests for the multi-platform course discovery API."""

from fastapi.testclient import TestClient


def test_discover_sources(client: TestClient):
    """Verify that all 7 educational platforms are registered."""
    response = client.get("/api/v1/discover/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 7
    ids = [s["id"] for s in sources]
    assert "nptel" in ids
    assert "swayam" in ids
    assert "mit_ocw" in ids
    assert "mitx" in ids
    assert "khan_academy" in ids
    assert "edx" in ids
    assert "coursera" in ids


def test_discover_search_machine_learning(client: TestClient):
    """Verify unified cross-platform search returns courses from multiple platforms."""
    response = client.get("/api/v1/discover/search?q=Machine+Learning")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    courses = data["courses"]
    assert len(courses) > 0

    # Verify courses have proper platform and access attribution
    platforms_found = {c["source_platform"] for c in courses}
    assert len(platforms_found) >= 2  # At least NPTEL and SWAYAM or Coursera

    for c in courses:
        assert c["title"]
        assert c["source_platform"]
        assert c["source_platform_name"]
        assert c["source_url"]
        assert c["access_type"]
        assert c["access_type_label"]


def test_discover_search_platform_filter(client: TestClient):
    """Verify platform filtering works."""
    response = client.get("/api/v1/discover/search?q=learning&platforms=mit_ocw,mitx")
    assert response.status_code == 200
    data = response.json()
    for c in data["courses"]:
        assert c["source_platform"] in ("mit_ocw", "mitx")


def test_discover_course_detail(client: TestClient):
    """Verify detailed module and resource retrieval for a specific course."""
    response = client.get("/api/v1/discover/course/nptel/nptel-ml-106106139")
    assert response.status_code == 200
    detail = response.json()
    assert detail["title"] == "Machine Learning"
    assert detail["source_platform"] == "nptel"
    assert len(detail["modules"]) >= 4
    # Check resources inside module
    first_module = detail["modules"][0]
    assert len(first_module["resources"]) > 0


def test_discover_categories(client: TestClient):
    """Verify category listing."""
    response = client.get("/api/v1/discover/categories")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) > 0
    assert any("Computer Science" in c for c in data["categories"])


def test_discover_ingest_course(client: TestClient):
    """Verify course enrollment and ingestion into KnowTrace."""
    payload = {
        "platform": "nptel",
        "source_id": "nptel-ml-106106139",
    }
    response = client.post("/api/v1/discover/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("enrolled", "existing")
    assert data["course_id"]
    assert "Machine Learning" in data["title"]
