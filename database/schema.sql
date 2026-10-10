-- ============================================================
-- KnowTrace Database Schema
-- PostgreSQL 16 + pgvector + tsvector
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── 1. Users ────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 2. Courses ──────────────────────────────────────────────
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  exam_date DATE,
  hours_per_day FLOAT DEFAULT 2.0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(owner_id, title)
);

-- ─── 3. Sources ──────────────────────────────────────────────
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,        -- pdf, pptx, video, image
  filename VARCHAR(500) NOT NULL,
  uri VARCHAR(1000),
  file_hash VARCHAR(64),            -- SHA256
  status VARCHAR(50) DEFAULT 'queued',  -- queued, processing, done, failed
  stage VARCHAR(100),               -- parse, ocr, vision, transcribe, tag, embed
  progress FLOAT DEFAULT 0.0,
  error_message TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 4. Topics ───────────────────────────────────────────────
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 5. Concepts ─────────────────────────────────────────────
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  importance FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 6. Content Chunks (Provenance Spine) ────────────────────
CREATE TABLE content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  modality VARCHAR(50),             -- text, figure, chart, equation, transcript
  text TEXT NOT NULL,
  visual JSONB,                     -- caption, extracted_labels[], structured_data, image_uri, bbox
  page INTEGER,
  slide INTEGER,
  ts_start FLOAT,                   -- seconds
  ts_end FLOAT,
  bbox FLOAT4[],                    -- [x0, y0, x1, y1]
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  difficulty FLOAT DEFAULT 0.5,
  extraction_confidence FLOAT DEFAULT 0.9,
  language VARCHAR(10) DEFAULT 'en',
  embedding VECTOR(1024),           -- bge-m3
  embedding_id VARCHAR(255),
  tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', text)) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 7. Chunk-Concept Association ────────────────────────────
CREATE TABLE chunk_concepts (
  chunk_id UUID NOT NULL REFERENCES content_chunks(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  relevance FLOAT DEFAULT 1.0,
  role VARCHAR(50) DEFAULT 'primary',
  PRIMARY KEY (chunk_id, concept_id)
);

-- ─── 8. Prerequisites (Knowledge Graph Edges) ───────────────
CREATE TABLE prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  weight FLOAT DEFAULT 1.0,
  kind VARCHAR(50) DEFAULT 'requires',
  confidence FLOAT DEFAULT 1.0,
  rationale TEXT,
  UNIQUE(concept_id, prerequisite_id)
);

-- ─── 9. Questions ────────────────────────────────────────────
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  source_chunk_ids UUID[] DEFAULT '{}',
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,  -- mcq, short_answer, code, true_false
  options JSONB,                       -- [{key, text, is_correct}]
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty FLOAT DEFAULT 0.5,
  bloom_level VARCHAR(50),             -- remember, understand, apply, analyze, evaluate, create
  status VARCHAR(50) DEFAULT 'draft',  -- draft, approved, rejected
  validated_by VARCHAR(100),
  validation_notes TEXT,
  support_span TEXT,
  source_chunk_id UUID REFERENCES content_chunks(id) ON DELETE SET NULL,
  numerical_python TEXT,
  marking_rubric TEXT,
  validation_report JSONB DEFAULT '{}',
  embedding JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 10. Assessments ─────────────────────────────────────────
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  assessment_type VARCHAR(50) DEFAULT 'quiz',  -- diagnostic, formative, quiz
  question_ids UUID[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 11. Attempts ────────────────────────────────────────────
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score FLOAT DEFAULT 0.0,
  feedback TEXT DEFAULT '',
  response_time_ms INTEGER,
  misconception_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 12. Learner Mastery (BKT) ──────────────────────────────
CREATE TABLE learner_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  p_know FLOAT DEFAULT 0.1,
  confidence FLOAT DEFAULT 0.0,
  n_obs INTEGER DEFAULT 0,
  half_life FLOAT DEFAULT 3.0,
  last_practiced_at TIMESTAMP,
  history JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, concept_id)
);

CREATE TABLE mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  p_before FLOAT NOT NULL,
  p_after FLOAT NOT NULL,
  p_eff FLOAT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  correct BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mastery_history_user_concept ON mastery_history(user_id, concept_id);

-- ─── 13. Misconceptions ─────────────────────────────────────
CREATE TABLE misconceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  concept_a UUID,
  concept_b UUID,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  pattern_signature VARCHAR(255),
  remediation_chunk_id UUID REFERENCES content_chunks(id) ON DELETE SET NULL,
  wrong_answer_patterns JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  detected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_misconceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  misconception_id UUID NOT NULL REFERENCES misconceptions(id) ON DELETE CASCADE,
  severity FLOAT DEFAULT 0.0,
  status VARCHAR(20) DEFAULT 'resolved',
  evidence_attempt_ids JSONB DEFAULT '[]',
  last_updated TIMESTAMP DEFAULT NOW(),
  remediation_pack JSONB DEFAULT '{}',
  UNIQUE(user_id, misconception_id)
);
CREATE INDEX idx_user_misconceptions_active ON user_misconceptions(user_id, status);

-- ─── 14. Chat Turns ──────────────────────────────────────────
CREATE TABLE chat_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,         -- user, assistant, system
  content TEXT NOT NULL,
  anchored_chunk_ids UUID[] DEFAULT '{}',
  outside_knowledge BOOLEAN DEFAULT false,
  refusal BOOLEAN DEFAULT false,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── 15. Study Plans ─────────────────────────────────────────
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  target_date DATE,
  topics_priority JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  progress FLOAT DEFAULT 0.0,
  plan_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════ Indexes ═════════════════════════════════════
CREATE INDEX idx_sources_course ON sources(course_id);
CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_content_chunks_course ON content_chunks(course_id);
CREATE INDEX idx_content_chunks_source ON content_chunks(source_id);
CREATE INDEX idx_content_chunks_topic ON content_chunks(topic_id);
CREATE INDEX idx_content_chunks_tsv ON content_chunks USING GIN(tsv);
CREATE INDEX idx_content_chunks_embedding ON content_chunks USING hnsw(embedding vector_cosine_ops);
CREATE INDEX idx_questions_concept ON questions(concept_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_learner_mastery_user ON learner_mastery(user_id);
CREATE INDEX idx_chat_turns_session ON chat_turns(session_id);
CREATE INDEX idx_topics_course ON topics(course_id);
CREATE INDEX idx_concepts_topic ON concepts(topic_id);

-- ═══════════════ Verify ══════════════════════════════════════
SELECT extname, extversion FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'vector');
