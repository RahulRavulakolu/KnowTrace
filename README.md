# KnowTrace

KnowTrace is a **source-anchored adaptive AI tutor for personalized learning**.
It ingests course material, answers with page/slide/video citations, models
learner mastery, detects misconceptions, and adapts practice and study plans.

## Quick start

```powershell
Copy-Item .env.example .env
# add GEMINI_API_KEY and GROQ_API_KEY
docker compose up -d
```

Open `http://localhost:3000` and `http://localhost:8000/docs`. Generate an
offline demo snapshot with:

```powershell
.\.venv\Scripts\python.exe scripts\prepare_demo.py
```

## Results

| Measure | Target/result |
|---|---:|
| RAGAS faithfulness | 0.82 |
| Citation accuracy | 96% |
| Adaptive gain vs random | 1.6x |

These are evaluation targets/fixture results, not evidence of human efficacy.
The simulator uses an independent IRT model and is explicitly labeled as such.

## Documentation

- [Architecture](docs/architecture.md)
- [Grounding](docs/grounding.md)
- [Learner model](docs/learner_model.md)
- [Evaluation](docs/evaluation.md)
- [API reference](docs/api.md)

Demo identities are `fresh_user@demo.local` and
`returning_user@demo.local` in generated fixtures.
