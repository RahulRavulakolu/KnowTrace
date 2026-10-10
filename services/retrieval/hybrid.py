"""Hybrid dense and lexical retrieval with PostgreSQL and SQLite support."""

from __future__ import annotations

import math
from typing import Any

from sqlalchemy import bindparam, text
from sqlalchemy.orm import Session

from backend.models.db import ContentChunk


def _filters(scope_filters: dict[str, Any] | None, params: dict[str, Any]) -> str:
    """Build optional PostgreSQL filter predicates."""
    filters = scope_filters or {}
    clauses: list[str] = []
    if filters.get("topic_ids"):
        clauses.append("c.topic_id IN :topic_ids")
        params["topic_ids"] = tuple(filters["topic_ids"])
    if filters.get("concept_ids"):
        clauses.append("EXISTS (SELECT 1 FROM chunk_concepts cc WHERE cc.chunk_id=c.id AND cc.concept_id IN :concept_ids)")
        params["concept_ids"] = tuple(filters["concept_ids"])
    if filters.get("source_types"):
        clauses.append("s.type IN :source_types")
        params["source_types"] = tuple(filters["source_types"])
    return "".join(f" AND {clause}" for clause in clauses)


def _statement(sql: str, params: dict[str, Any]):
    """Create SQL with expanding parameters for optional ID/type filters."""
    statement = text(sql)
    expanding = [name for name in ("topic_ids", "concept_ids", "source_types") if name in params]
    if expanding:
        statement = statement.bindparams(*(bindparam(name, expanding=True) for name in expanding))
    return statement


def dense_retrieval(query_embedding: list[float], course_id: str,
                    scope_filters: dict[str, Any] | None = None, top_k: int = 30,
                    db_session: Session | None = None) -> list[tuple[str, float]]:
    """Retrieve using pgvector cosine distance, or cosine similarity in SQLite tests."""
    if db_session is None:
        raise ValueError("db_session is required")
    params: dict[str, Any] = {"course_id": course_id, "embedding": query_embedding, "limit": top_k}
    where = _filters(scope_filters, params)
    if db_session.bind and db_session.bind.dialect.name == "postgresql":
        rows = db_session.execute(_statement(
            f"""SELECT c.id, 1 - (c.embedding <=> CAST(:embedding AS vector)) AS score
            FROM content_chunks c JOIN sources s ON s.id=c.source_id
            WHERE c.course_id=:course_id AND c.embedding IS NOT NULL {where}
            ORDER BY c.embedding <=> CAST(:embedding AS vector) LIMIT :limit"""
        ), params).all()
        return [(str(row[0]), float(row[1])) for row in rows]
    chunks = db_session.query(ContentChunk).filter(ContentChunk.course_id == course_id).all()
    qnorm = math.sqrt(sum(value * value for value in query_embedding)) or 1.0
    scored = []
    for chunk in chunks:
        vector = chunk.embedding or []
        norm = math.sqrt(sum(float(value) ** 2 for value in vector)) or 1.0
        score = sum(float(a) * float(b) for a, b in zip(query_embedding, vector)) / (qnorm * norm)
        scored.append((str(chunk.id), score))
    return sorted(scored, key=lambda item: item[1], reverse=True)[:top_k]


def keyword_retrieval(query: str, course_id: str, scope_filters: dict[str, Any] | None = None,
                      top_k: int = 30, db_session: Session | None = None) -> list[tuple[str, float]]:
    """Retrieve using PostgreSQL tsvector ranking, or token overlap in SQLite tests."""
    if db_session is None:
        raise ValueError("db_session is required")
    params: dict[str, Any] = {"course_id": course_id, "query": query, "limit": top_k}
    where = _filters(scope_filters, params)
    if db_session.bind and db_session.bind.dialect.name == "postgresql":
        rows = db_session.execute(_statement(
            f"""SELECT c.id, ts_rank_cd(c.tsv, websearch_to_tsquery('english', :query)) AS score
            FROM content_chunks c JOIN sources s ON s.id=c.source_id
            WHERE c.course_id=:course_id AND c.tsv @@ websearch_to_tsquery('english', :query) {where}
            ORDER BY score DESC LIMIT :limit"""
        ), params).all()
        return [(str(row[0]), float(row[1])) for row in rows]
    tokens = set(query.lower().split())
    chunks = db_session.query(ContentChunk).filter(ContentChunk.course_id == course_id).all()
    scored = [(str(chunk.id), len(tokens & set(chunk.text.lower().split())) / max(len(tokens), 1))
              for chunk in chunks]
    return sorted(scored, key=lambda item: item[1], reverse=True)[:top_k]


def reciprocal_rank_fusion(dense_results: list[tuple[str, float]],
                           keyword_results: list[tuple[str, float]], k: int = 60,
                           top_k: int | None = None) -> list[tuple[str, float]]:
    """Merge ranked result lists using reciprocal rank fusion."""
    scores: dict[str, float] = {}
    for rank, (chunk_id, _) in enumerate(dense_results):
        scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (rank + 1)
    for rank, (chunk_id, _) in enumerate(keyword_results):
        scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (rank + 1)
    result = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return result[:top_k] if top_k else result


def retrieve(query: str, query_embedding: list[float], course_id: str,
             scope_filters: dict[str, Any] | None = None, top_k: int = 30,
             db_session: Session | None = None) -> list[ContentChunk]:
    """Return full chunks ranked by hybrid retrieval score."""
    if db_session is None:
        raise ValueError("db_session is required")
    fused = reciprocal_rank_fusion(
        dense_retrieval(query_embedding, course_id, scope_filters, top_k, db_session),
        keyword_retrieval(query, course_id, scope_filters, top_k, db_session),
        top_k=top_k,
    )
    chunks = {str(chunk.id): chunk for chunk in db_session.query(ContentChunk).filter(
        ContentChunk.id.in_([item[0] for item in fused])
    ).all()}
    for chunk_id, score in fused:
        if chunk_id in chunks:
            setattr(chunks[chunk_id], "_retrieval_score", score)
    return [chunks[item[0]] for item in fused if item[0] in chunks]
