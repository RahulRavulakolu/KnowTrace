"""Cold-start and learner endpoint coverage."""


def test_mastery_endpoint_empty_course(client, db_session) -> None:
    response = client.get("/learner/mastery?course_id=missing")
    assert response.status_code in {200, 404}
