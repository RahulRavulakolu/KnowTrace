"""Focused tests for video transcript and keyframe processing."""

from types import SimpleNamespace

from services.ingestion import video


def test_transcript_windows_and_low_confidence_flag() -> None:
    """Timestamped words are grouped and low-probability words are marked."""
    segments = [
        {
            "start": 0.0,
            "end": 20.0,
            "avg_logprob": -0.2,
            "words": [
                {"start": 0.0, "end": 10.0, "word": "Intro", "probability": 0.9},
                {"start": 10.0, "end": 20.0, "word": "uncertain", "probability": 0.2},
            ],
        }
    ]
    chunks = video._transcript_windows(segments)
    assert len(chunks) == 1
    assert chunks[0]["ts_start"] == 0.0
    assert chunks[0]["ts_end"] == 20.0
    assert chunks[0]["modality"] == "transcript"
    assert chunks[0]["meta"]["low_asr_confidence"] is True


def test_transcript_windows_end_on_sentence_boundary() -> None:
    """Windows close at punctuation after reaching the target duration."""
    words = [
        {
            "start": float(index),
            "end": float(index + 1),
            "word": "Sentence." if index == 30 else "word",
            "probability": 0.9,
        }
        for index in range(31)
    ]
    chunks = video._transcript_windows([{"words": words}])
    assert len(chunks) == 1
    assert chunks[0]["ts_end"] == 31.0


def test_process_keyframes_creates_figure_chunk(monkeypatch) -> None:
    """Useful visual frames retain timestamp and transcript provenance."""
    response = SimpleNamespace(
        data={
            "shows": "A labeled diagram",
            "visible_text": "Force = mass * acceleration",
            "description": "A mechanics diagram",
            "relationship_to_speech": "Illustrates the explanation",
            "useful_for_study": True,
        }
    )
    monkeypatch.setattr(video, "call_llm", lambda *args, **kwargs: response)
    chunks = video.process_keyframes(
        [(12.0, "frame.jpg")],
        "course",
        "source",
        [{"text": "Newton's law", "ts_start": 0.0, "ts_end": 20.0}],
    )
    assert len(chunks) == 1
    assert chunks[0]["modality"] == "figure"
    assert chunks[0]["ts_start"] == 12.0
    assert chunks[0]["ts_end"] == 20.0
    assert "Newton's law" in chunks[0]["text"]


def test_process_keyframes_skips_talking_head(monkeypatch) -> None:
    """Frames explicitly marked as unhelpful are not persisted as figures."""
    monkeypatch.setattr(
        video,
        "call_llm",
        lambda *args, **kwargs: SimpleNamespace(data={"useful_for_study": False}),
    )
    assert video.process_keyframes([(1.0, "frame.jpg")], "course", "source", []) == []
