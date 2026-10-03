# Phase 0: Project Setup & Core Infrastructure Overview

## Summary of Deliverables
In Phase 0, we established the core foundation for **KnowTrace: Source-Anchored Adaptive Tutor**.

### 1. Pinned Technology Stack & Dependencies
- Python 3.11 with pinned dependencies (`fastapi==0.104.1`, `sqlalchemy==2.0.23`, `pydantic==2.5.0`, `psycopg[binary]==3.1.17`, `google-generativeai==0.3.2`, `groq==0.4.1`, `tenacity==8.2.3`, `pgvector==0.2.4`, `alembic==1.13.0`, `pytest==7.4.3`, etc.).
- Next.js 14 frontend scaffolding with TypeScript, Tailwind CSS, and TanStack React Query.

### 2. Complete 15-Table Relational Schema
All 15 required entities implemented in `database/models.py`:
1. `users`
2. `courses`
3. `sources`
4. `topics`
5. `concepts`
6. `content_chunks` (The **Provenance Spine**: `source_id`, `page_number`, `slide_number`, `ts_start`, `ts_end`, `bbox`, `embedding` [1024-dim Vector], `search_vector` [TSVector])
7. `chunk_concepts` (Association table with relevance scores)
8. `prerequisites` (Directed knowledge graph edges with strict/soft relationship types)
9. `questions` (Status pipeline: draft -> approved / rejected; psychometric auditing)
10. `assessments`
11. `attempts`
12. `learner_mastery` (Bayesian Knowledge Tracing / Deep Knowledge Tracing state)
13. `misconceptions` (Diagnostic learner error patterns linked to remediation chunks)
14. `chat_turns` (Conversational tutoring turns tracking `outside_knowledge_used` and `refusal_triggered`)
15. `study_plans`

### 3. Unified LLM Gateway (`backend/core/llm.py`)
- Single entrypoint `call_llm(vendor, prompt, json_schema, images, temperature)`.
- Vendor A = Google Gemini (generation, vision, multimodal).
- Vendor B = Groq / Claude (academic validation and psychometric auditing).
- Resilient retry logic with `tenacity` exponential backoff.
- Structured JSON output parsing and validation against Pydantic models.

### 4. Centralized Modular Prompts (`services/<module>/prompts.py`)
- `services/ingestion/prompts.py`
- `services/retrieval/prompts.py`
- `services/assessment/prompts.py`
- `services/learner_model/prompts.py`
- `services/graph/prompts.py`
- Zero inline prompts in backend code.

### 5. Docker Compose & Database Initialization
- `docker/docker-compose.yml` orchestrating PostgreSQL 16 (`pgvector/pgvector:pg16`), Redis 7 Alpine, FastAPI backend, RQ background worker, and Next.js frontend.
- `database/init.sql` enabling `uuid-ossp`, `pg_trgm`, and `vector` extensions.
- `alembic.ini` and `database/migrations/` for schema migrations.

### 6. Test Suite & Quality Verification
- 24 tests covering logging with request IDs, models and provenance spine, question status approval filters, refusal flags, LLM gateway, and FastAPI health routes.
