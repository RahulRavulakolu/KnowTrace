# Evaluation methodology

The benchmark contains 100 questions: 25 direct, 25 reasoning, 20 multimodal,
15 cross-source, and 15 unsupported. Two annotations are compared with Cohen's
kappa, with disagreements emitted for consensus review.

RAGAS reports faithfulness, answer relevancy, context precision, and context
recall using the vendor-B judge adapter. Custom metrics include hit@1/3/6, MRR,
location-aware citation accuracy/recall, refusal precision/recall, and
over-refusal. Confidence intervals use 1,000 bootstrap resamples at the
2.5/97.5 percentiles.

Five ablations compare dense, hybrid, reranked, verified, and no-vision
retrieval. The simulator evaluates four profiles, three policies, ten seeds,
and six sessions using an independent IRT model. It is simulated data, not
human evidence.
