# API reference

All routes are prefixed with `/api/v1`.

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/health` | Service health | 200 |
| POST | `/courses` | Create course | 201 |
| GET | `/courses/{id}` | Read course | 200 |
| POST | `/courses/{id}/sources` | Upload sources | 202 |
| GET | `/courses/{id}/processing-status` | Source progress | 200 |
| POST | `/chat` | Grounded question | 200 |
| POST | `/assessments` | Create diagnostic/quiz/mock | 201 |
| POST | `/assessments/{id}/next` | Select question | 200 |
| POST | `/assessments/{id}/submit` | Grade response | 200 |
| GET | `/assessments/{id}/report` | Assessment report | 200 |
| GET | `/learner/mastery?course_id=...` | Mastery state | 200 |
| GET | `/learner/misconceptions?course_id=...` | Misconceptions | 200 |
| POST | `/misconceptions/{id}/remediate` | Remediation pack | 200 |
| GET | `/study-plan?course_id=...` | Study plan | 200 |
| POST | `/study-plan/regenerate?course_id=...` | Rebuild plan | 200 |
| GET | `/courses/{id}/graph` | Knowledge graph | 200 |

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"COURSE_ID","message":"What is regularization?"}'
```

Validation failures return 422, missing resources 404, and provider failures
return explicit errors or degraded-mode responses.
