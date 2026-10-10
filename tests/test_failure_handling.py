from services.failure_handling import (
    audio_confidence_policy,
    cold_start_prior,
    llm_failure_message,
    reranker_failure_message,
    resample_question,
    scanned_pdf_route,
    vector_failure_message,
    video_policy,
    vision_failure,
    with_pdf_fallback,
)


def test_fallback_corrupt_pdf():
    assert (
        with_pdf_fallback(lambda: (_ for _ in ()).throw(ValueError("bad")), lambda: ["ok"]).mode
        == "secondary_parser"
    )


def test_fallback_scanned_pdf():
    assert scanned_pdf_route("") == "ocr"


def test_fallback_huge_video():
    assert video_policy(2000).mode == "capped"


def test_fallback_poor_audio():
    assert audio_confidence_policy(0.2).mode == "low_confidence"


def test_fallback_vision_failure():
    assert (
        vision_failure("figure.png", RuntimeError("unreadable"))["caption"] == "figure unreadable"
    )


def test_fallback_llm_failure():
    assert "temporarily unavailable" in llm_failure_message(RuntimeError("429"))


def test_fallback_reranker():
    assert "Degraded mode" in reranker_failure_message()


def test_fallback_vector_db():
    assert "keyword" in vector_failure_message()


def test_fallback_cold_start():
    assert cold_start_prior() == 0.3


def test_fallback_duplicate_question():
    assert resample_question([{"id": "a"}, {"id": "b"}], {"a"})["id"] == "b"
