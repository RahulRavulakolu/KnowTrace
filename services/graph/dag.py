"""Prerequisite DAG construction and transitive graph helpers."""

from typing import Any

import networkx as nx
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.models.db import Concept, Prerequisite, Topic


def detect_cycles(concept_ids: list[str], edges: list[dict[str, Any]]) -> list[list[str]]:
    """Return directed cycles from prerequisite edges."""
    graph = nx.DiGraph()
    graph.add_nodes_from(concept_ids)
    graph.add_edges_from(
        (str(edge["prerequisite_id"]), str(edge["concept_id"]))
        for edge in edges
        if edge.get("kind", "requires") == "requires"
    )
    return [list(cycle) for cycle in nx.simple_cycles(graph)]


def break_cycles(edges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Remove the lowest-confidence edge from each cycle."""
    remaining = list(edges)
    while True:
        nodes = {str(edge["concept_id"]) for edge in remaining} | {
            str(edge["prerequisite_id"]) for edge in remaining
        }
        cycles = detect_cycles(list(nodes), remaining)
        if not cycles:
            return remaining
        cycle = set(cycles[0])
        candidates = [
            edge
            for edge in remaining
            if edge.get("kind", "requires") == "requires"
            and str(edge["concept_id"]) in cycle
            and str(edge["prerequisite_id"]) in cycle
        ]
        if not candidates:
            return remaining
        remaining.remove(min(candidates, key=lambda edge: float(edge.get("confidence", 0.0))))


def cyclic_dag(course_id: str, db_session: Session) -> nx.DiGraph:
    """Load a course prerequisite graph and return a cycle-free DAG."""
    concepts = db_session.query(Concept).join(Topic).filter(Topic.course_id == course_id).all()
    concept_ids = [str(concept.id) for concept in concepts]
    prerequisites = (
        db_session.query(Prerequisite)
        .filter(
            Prerequisite.concept_id.in_(concept_ids),
            Prerequisite.kind == "requires",
        )
        .all()
    )
    edges = [
        {
            "concept_id": edge.concept_id,
            "prerequisite_id": edge.prerequisite_id,
            "kind": edge.kind,
            "confidence": edge.confidence,
        }
        for edge in prerequisites
    ]
    graph = nx.DiGraph()
    graph.add_nodes_from(concept_ids)
    graph.add_edges_from(
        (edge["prerequisite_id"], edge["concept_id"]) for edge in break_cycles(edges)
    )
    return graph


def _recursive_ids(concept_id: str, db_session: Session, dependents: bool = False) -> list[str]:
    """Query graph neighbors recursively to depth five."""
    edge_column = "concept_id" if dependents else "prerequisite_id"
    join_column = "prerequisite_id" if dependents else "concept_id"
    query = text(
        f"""
        WITH RECURSIVE graph(id, depth) AS (
            SELECT {edge_column}, 1 FROM prerequisites
            WHERE {join_column} = :concept_id AND kind = 'requires'
            UNION
            SELECT p.{edge_column}, graph.depth + 1
            FROM prerequisites p JOIN graph ON p.{join_column} = graph.id
            WHERE p.kind = 'requires' AND graph.depth < 5
        )
        SELECT DISTINCT id FROM graph WHERE id != :concept_id
    """
    )
    return [str(row[0]) for row in db_session.execute(query, {"concept_id": concept_id})]


def recursive_cte_prerequisites(concept_id: str, db_session: Session) -> list[str]:
    """Return direct and transitive prerequisite IDs to depth five."""
    return _recursive_ids(concept_id, db_session)


def recursive_cte_dependents(concept_id: str, db_session: Session) -> list[str]:
    """Return direct and transitive dependent IDs to depth five."""
    return _recursive_ids(concept_id, db_session, dependents=True)
