"""Focused tests for hybrid retrieval and source-grounded tutoring."""

from types import SimpleNamespace

from services.retrieval.hybrid import reciprocal_rank_fusion
from services.retrieval.tutor import citation_resolver, confidence_score, refusal_logic


def test_rrf_math() -> None:
    """RRF combines rank positions, independent of raw scores."""
    result = reciprocal_rank_fusion([("a", 0.9), ("b", 0.8)], [("b", 0.9), ("c", 0.7)])
    assert result[0][0] in {"a", "b"}
    assert dict(result)["b"] == 1.5


def test_citation_resolver_supports_all_modalities() -> None:
    """PDF, slide, and video provenance produce deep links."""
    chunks = [
        SimpleNamespace(id="p", source_id="s1", page=3, slide=None, ts_start=None, text="one two"),
        SimpleNamespace(
            id="s", source_id="s2", page=None, slide=4, ts_start=None, text="slide text"
        ),
        SimpleNamespace(
            id="v", source_id="s3", page=None, slide=None, ts_start=12.5, text="video words"
        ),
    ]
    citations = citation_resolver(chunks)
    assert citations[0]["link"] == "/view/s1?page=3"
    assert citations[1]["link"] == "/view/s2?slide=4"
    assert citations[2]["link"] == "/view/s3?t=12.5"


def test_confidence_and_refusal_modes() -> None:
    """Confidence bands map to source-backed, partial, and refusal modes."""
    assert confidence_score(0.95, 1.0, 2, 0.8)["level"] == "High"
    assert refusal_logic(0.9, "sufficient", 1.0, 0.35) == "source_backed"
    assert refusal_logic(0.1, "sufficient", 1.0, 0.35) == "not_covered"
    assert refusal_logic(0.8, "partial", 0.6, 0.35) == "partial"
