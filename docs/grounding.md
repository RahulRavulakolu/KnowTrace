# Source grounding

Every content chunk stores `source_id` plus page, slide, timestamp, and optional
bounding-box provenance. The model receives chunk identifiers; it never invents
page numbers. The API resolves `[S#]` labels back to those identifiers.

The P8 sufficiency judge uses a strict evidence threshold: topical similarity is
not sufficient evidence. P10 verifies claims sentence by sentence. Confidence
is `0.4*rerank + 0.3*ratio + 0.2*sources>=2 + 0.1*margin`.

The refusal threshold is swept on a development split and evaluated on held-out
data. Target metrics are at least 95% citation accuracy and 90% refusal
precision; actual results and confidence intervals are reported honestly.
