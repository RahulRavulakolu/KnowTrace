--
-- PostgreSQL database dump
--

\restrict npHjxPa082btNs7IkDnLS1CwqY1Qv4Dm1UUOjmXeO0SFhJASc00e5P8ErYSYinB

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg12+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id character varying(36) NOT NULL,
    course_id character varying(36) NOT NULL,
    user_id character varying(36),
    title character varying(255) NOT NULL,
    assessment_type character varying(50) NOT NULL,
    question_ids jsonb NOT NULL,
    config jsonb NOT NULL,
    status character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attempts (
    id character varying(36) NOT NULL,
    assessment_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    question_id character varying(36) NOT NULL,
    user_answer text NOT NULL,
    is_correct boolean NOT NULL,
    score double precision NOT NULL,
    feedback text,
    response_time_ms integer,
    misconception_id character varying(36),
    created_at timestamp without time zone NOT NULL
);


--
-- Name: catalog_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalog_courses (
    id character varying(36) NOT NULL,
    source_platform character varying(50) NOT NULL,
    source_id character varying(200) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    instructor character varying(255),
    institution character varying(255),
    category character varying(100),
    language character varying(50) NOT NULL,
    duration character varying(100),
    source_url character varying(1000) NOT NULL,
    access_type character varying(50) NOT NULL,
    certificate_available boolean NOT NULL,
    thumbnail_url character varying(1000),
    tags jsonb NOT NULL,
    start_date date,
    is_ingested boolean NOT NULL,
    ingested_course_id character varying(36),
    meta jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chat_turns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_turns (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id character varying(36) NOT NULL,
    session_id character varying(36) NOT NULL,
    role character varying(50) NOT NULL,
    content text NOT NULL,
    anchored_chunk_ids jsonb NOT NULL,
    outside_knowledge boolean NOT NULL,
    refusal boolean NOT NULL,
    meta jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chunk_concepts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chunk_concepts (
    chunk_id character varying(36) NOT NULL,
    concept_id character varying(36) NOT NULL,
    relevance double precision NOT NULL,
    role character varying(50) NOT NULL
);


--
-- Name: concepts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concepts (
    id character varying(36) NOT NULL,
    topic_id character varying(36) NOT NULL,
    name character varying(500) NOT NULL,
    description text,
    importance double precision NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: content_chunks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_chunks (
    id character varying(36) NOT NULL,
    course_id character varying(36) NOT NULL,
    source_id character varying(36) NOT NULL,
    modality character varying(50) NOT NULL,
    text text NOT NULL,
    visual jsonb,
    page integer,
    slide integer,
    ts_start double precision,
    ts_end double precision,
    bbox jsonb,
    topic_id character varying(36),
    difficulty double precision NOT NULL,
    extraction_confidence double precision NOT NULL,
    language character varying(10) NOT NULL,
    embedding public.vector(1024),
    embedding_id character varying(255),
    created_at timestamp without time zone NOT NULL
);


--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_modules (
    id character varying(36) NOT NULL,
    catalog_course_id character varying(36) NOT NULL,
    title character varying(500) NOT NULL,
    "order" integer NOT NULL,
    description text,
    meta jsonb NOT NULL
);


--
-- Name: course_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_resources (
    id character varying(36) NOT NULL,
    module_id character varying(36) NOT NULL,
    title character varying(500) NOT NULL,
    resource_type character varying(50) NOT NULL,
    url character varying(1000),
    description text,
    duration_minutes integer,
    downloadable boolean NOT NULL,
    "order" integer NOT NULL,
    meta jsonb NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id character varying(36) NOT NULL,
    owner_id character varying(36) NOT NULL,
    title character varying(500) NOT NULL,
    code character varying(100),
    exam_date date,
    hours_per_day double precision NOT NULL,
    created_at timestamp without time zone NOT NULL,
    source_platform character varying(50),
    source_id character varying(200),
    source_url character varying(1000),
    access_type character varying(50),
    instructor character varying(200),
    institution character varying(200),
    category character varying(100),
    language character varying(50),
    duration character varying(100),
    thumbnail_url character varying(1000),
    certificate_available boolean NOT NULL,
    is_ingested boolean NOT NULL,
    description text
);


--
-- Name: learner_mastery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learner_mastery (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    concept_id character varying(36) NOT NULL,
    p_know double precision NOT NULL,
    confidence double precision NOT NULL,
    n_obs integer NOT NULL,
    half_life double precision NOT NULL,
    last_practiced_at timestamp without time zone,
    history jsonb NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: mastery_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mastery_history (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    concept_id character varying(36) NOT NULL,
    p_before double precision NOT NULL,
    p_after double precision NOT NULL,
    p_eff double precision NOT NULL,
    event_type character varying(50) NOT NULL,
    correct boolean,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: misconceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.misconceptions (
    id character varying(36) NOT NULL,
    concept_id character varying(36) NOT NULL,
    course_id character varying(36),
    concept_a character varying(36),
    concept_b character varying(36),
    wrong_answer_patterns jsonb NOT NULL,
    user_id character varying(36),
    label character varying(255) NOT NULL,
    description text NOT NULL,
    pattern_signature character varying(255),
    remediation_chunk_id character varying(36),
    status character varying(50) NOT NULL,
    detected_at timestamp without time zone NOT NULL
);


--
-- Name: prerequisites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prerequisites (
    id character varying(36) NOT NULL,
    concept_id character varying(36) NOT NULL,
    prerequisite_id character varying(36) NOT NULL,
    weight double precision NOT NULL,
    kind character varying(50) NOT NULL,
    confidence double precision NOT NULL,
    rationale text
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id character varying(36) NOT NULL,
    concept_id character varying(36) NOT NULL,
    source_chunk_ids jsonb NOT NULL,
    question_text text NOT NULL,
    question_type character varying(50) NOT NULL,
    options jsonb,
    correct_answer text NOT NULL,
    explanation text NOT NULL,
    difficulty double precision NOT NULL,
    bloom_level character varying(50),
    status character varying(50) NOT NULL,
    validated_by character varying(100),
    validation_notes text,
    support_span text,
    source_chunk_id character varying(36),
    numerical_python text,
    marking_rubric text,
    validation_report jsonb NOT NULL,
    embedding jsonb,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sources (
    id character varying(36) NOT NULL,
    course_id character varying(36) NOT NULL,
    type character varying(50) NOT NULL,
    filename character varying(500) NOT NULL,
    uri character varying(1000),
    file_hash character varying(64),
    status character varying(50) NOT NULL,
    stage character varying(100),
    progress double precision NOT NULL,
    error_message text,
    meta jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: study_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_plans (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    course_id character varying(36) NOT NULL,
    title character varying(255) NOT NULL,
    target_date date,
    topics_priority jsonb NOT NULL,
    status character varying(50) NOT NULL,
    progress double precision NOT NULL,
    plan_data jsonb NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id character varying(36) NOT NULL,
    course_id character varying(36) NOT NULL,
    parent_id character varying(36),
    name character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: user_misconceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_misconceptions (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    misconception_id character varying(36) NOT NULL,
    severity double precision NOT NULL,
    status character varying(20) NOT NULL,
    evidence_attempt_ids jsonb NOT NULL,
    last_updated timestamp without time zone NOT NULL,
    remediation_pack jsonb NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(36) NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    created_at timestamp without time zone NOT NULL
);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: attempts attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_pkey PRIMARY KEY (id);


--
-- Name: catalog_courses catalog_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_courses
    ADD CONSTRAINT catalog_courses_pkey PRIMARY KEY (id);


--
-- Name: chat_turns chat_turns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_turns
    ADD CONSTRAINT chat_turns_pkey PRIMARY KEY (id);


--
-- Name: chunk_concepts chunk_concepts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chunk_concepts
    ADD CONSTRAINT chunk_concepts_pkey PRIMARY KEY (chunk_id, concept_id);


--
-- Name: concepts concepts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concepts
    ADD CONSTRAINT concepts_pkey PRIMARY KEY (id);


--
-- Name: content_chunks content_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_chunks
    ADD CONSTRAINT content_chunks_pkey PRIMARY KEY (id);


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: course_resources course_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: learner_mastery learner_mastery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learner_mastery
    ADD CONSTRAINT learner_mastery_pkey PRIMARY KEY (id);


--
-- Name: mastery_history mastery_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mastery_history
    ADD CONSTRAINT mastery_history_pkey PRIMARY KEY (id);


--
-- Name: misconceptions misconceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misconceptions
    ADD CONSTRAINT misconceptions_pkey PRIMARY KEY (id);


--
-- Name: prerequisites prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisites
    ADD CONSTRAINT prerequisites_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: sources sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sources
    ADD CONSTRAINT sources_pkey PRIMARY KEY (id);


--
-- Name: study_plans study_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT study_plans_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: catalog_courses uq_catalog_platform_source_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_courses
    ADD CONSTRAINT uq_catalog_platform_source_id UNIQUE (source_platform, source_id);


--
-- Name: courses uq_owner_course_title; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT uq_owner_course_title UNIQUE (owner_id, title);


--
-- Name: prerequisites uq_prereq_edge; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisites
    ADD CONSTRAINT uq_prereq_edge UNIQUE (concept_id, prerequisite_id);


--
-- Name: learner_mastery uq_user_concept_mastery; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learner_mastery
    ADD CONSTRAINT uq_user_concept_mastery UNIQUE (user_id, concept_id);


--
-- Name: user_misconceptions user_misconceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_misconceptions
    ADD CONSTRAINT user_misconceptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_attempts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_attempts_user_id ON public.attempts USING btree (user_id);


--
-- Name: ix_catalog_courses_access_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_catalog_courses_access_type ON public.catalog_courses USING btree (access_type);


--
-- Name: ix_catalog_courses_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_catalog_courses_category ON public.catalog_courses USING btree (category);


--
-- Name: ix_catalog_courses_is_ingested; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_catalog_courses_is_ingested ON public.catalog_courses USING btree (is_ingested);


--
-- Name: ix_catalog_courses_source_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_catalog_courses_source_platform ON public.catalog_courses USING btree (source_platform);


--
-- Name: ix_chat_turns_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_turns_session_id ON public.chat_turns USING btree (session_id);


--
-- Name: ix_concepts_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_concepts_topic_id ON public.concepts USING btree (topic_id);


--
-- Name: ix_content_chunks_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_content_chunks_course_id ON public.content_chunks USING btree (course_id);


--
-- Name: ix_content_chunks_source_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_content_chunks_source_id ON public.content_chunks USING btree (source_id);


--
-- Name: ix_content_chunks_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_content_chunks_topic_id ON public.content_chunks USING btree (topic_id);


--
-- Name: ix_course_modules_catalog_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_course_modules_catalog_course_id ON public.course_modules USING btree (catalog_course_id);


--
-- Name: ix_course_resources_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_course_resources_module_id ON public.course_resources USING btree (module_id);


--
-- Name: ix_course_resources_resource_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_course_resources_resource_type ON public.course_resources USING btree (resource_type);


--
-- Name: ix_learner_mastery_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_learner_mastery_user_id ON public.learner_mastery USING btree (user_id);


--
-- Name: ix_mastery_history_concept_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mastery_history_concept_id ON public.mastery_history USING btree (concept_id);


--
-- Name: ix_mastery_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mastery_history_created_at ON public.mastery_history USING btree (created_at);


--
-- Name: ix_mastery_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mastery_history_user_id ON public.mastery_history USING btree (user_id);


--
-- Name: ix_misconceptions_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_misconceptions_course_id ON public.misconceptions USING btree (course_id);


--
-- Name: ix_questions_concept_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_questions_concept_id ON public.questions USING btree (concept_id);


--
-- Name: ix_questions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_questions_status ON public.questions USING btree (status);


--
-- Name: ix_sources_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sources_course_id ON public.sources USING btree (course_id);


--
-- Name: ix_topics_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_topics_course_id ON public.topics USING btree (course_id);


--
-- Name: ix_user_misconceptions_last_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_misconceptions_last_updated ON public.user_misconceptions USING btree (last_updated);


--
-- Name: ix_user_misconceptions_misconception_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_misconceptions_misconception_id ON public.user_misconceptions USING btree (misconception_id);


--
-- Name: ix_user_misconceptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_misconceptions_status ON public.user_misconceptions USING btree (status);


--
-- Name: ix_user_misconceptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_misconceptions_user_id ON public.user_misconceptions USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: assessments assessments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: attempts attempts_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: attempts attempts_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: attempts attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: catalog_courses catalog_courses_ingested_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_courses
    ADD CONSTRAINT catalog_courses_ingested_course_id_fkey FOREIGN KEY (ingested_course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: chat_turns chat_turns_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_turns
    ADD CONSTRAINT chat_turns_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: chat_turns chat_turns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_turns
    ADD CONSTRAINT chat_turns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chunk_concepts chunk_concepts_chunk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chunk_concepts
    ADD CONSTRAINT chunk_concepts_chunk_id_fkey FOREIGN KEY (chunk_id) REFERENCES public.content_chunks(id) ON DELETE CASCADE;


--
-- Name: chunk_concepts chunk_concepts_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chunk_concepts
    ADD CONSTRAINT chunk_concepts_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: concepts concepts_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concepts
    ADD CONSTRAINT concepts_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: content_chunks content_chunks_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_chunks
    ADD CONSTRAINT content_chunks_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: content_chunks content_chunks_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_chunks
    ADD CONSTRAINT content_chunks_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE;


--
-- Name: content_chunks content_chunks_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_chunks
    ADD CONSTRAINT content_chunks_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: course_modules course_modules_catalog_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_catalog_course_id_fkey FOREIGN KEY (catalog_course_id) REFERENCES public.catalog_courses(id) ON DELETE CASCADE;


--
-- Name: course_resources course_resources_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;


--
-- Name: courses courses_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: learner_mastery learner_mastery_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learner_mastery
    ADD CONSTRAINT learner_mastery_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: learner_mastery learner_mastery_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learner_mastery
    ADD CONSTRAINT learner_mastery_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mastery_history mastery_history_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mastery_history
    ADD CONSTRAINT mastery_history_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: mastery_history mastery_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mastery_history
    ADD CONSTRAINT mastery_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: misconceptions misconceptions_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misconceptions
    ADD CONSTRAINT misconceptions_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: misconceptions misconceptions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misconceptions
    ADD CONSTRAINT misconceptions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: misconceptions misconceptions_remediation_chunk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misconceptions
    ADD CONSTRAINT misconceptions_remediation_chunk_id_fkey FOREIGN KEY (remediation_chunk_id) REFERENCES public.content_chunks(id) ON DELETE SET NULL;


--
-- Name: misconceptions misconceptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misconceptions
    ADD CONSTRAINT misconceptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prerequisites prerequisites_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisites
    ADD CONSTRAINT prerequisites_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: prerequisites prerequisites_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisites
    ADD CONSTRAINT prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: questions questions_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE CASCADE;


--
-- Name: questions questions_source_chunk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_source_chunk_id_fkey FOREIGN KEY (source_chunk_id) REFERENCES public.content_chunks(id) ON DELETE SET NULL;


--
-- Name: sources sources_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sources
    ADD CONSTRAINT sources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: study_plans study_plans_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT study_plans_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: study_plans study_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT study_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: topics topics_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: topics topics_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: user_misconceptions user_misconceptions_misconception_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_misconceptions
    ADD CONSTRAINT user_misconceptions_misconception_id_fkey FOREIGN KEY (misconception_id) REFERENCES public.misconceptions(id) ON DELETE CASCADE;


--
-- Name: user_misconceptions user_misconceptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_misconceptions
    ADD CONSTRAINT user_misconceptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict npHjxPa082btNs7IkDnLS1CwqY1Qv4Dm1UUOjmXeO0SFhJASc00e5P8ErYSYinB

