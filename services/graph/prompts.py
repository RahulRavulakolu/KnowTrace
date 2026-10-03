"""Prompt templates for Knowledge Graph and Prerequisite Extraction Service.

Rule 4: Every prompt lives in services/<module>/prompts.py, never inline.
"""

# Extracting concepts and topics from syllabus or chapter structure
CONCEPT_HIERARCHY_EXTRACTION_PROMPT = """You are a knowledge graph architect.
Analyze the following course material outline or text chunk:
\"\"\"{outline_text}\"\"\"

Extract a structured hierarchy of Concepts:
For each concept provide:
- name: Unique, standardized name
- description: Concise definition
- difficulty: Estimated baseline difficulty (0.0 to 1.0)
- parent_topic: High-level module or topic name"""

# Discovering prerequisite dependencies between two concepts
PREREQUISITE_IDENTIFICATION_PROMPT = """You are an educational ontologist.
Evaluate the dependency relationship between two concepts:

Concept 1: {concept_a_name} - {concept_a_desc}
Concept 2: {concept_b_name} - {concept_b_desc}

Determine whether Concept 1 is a prerequisite for understanding Concept 2.
Output a JSON evaluation with:
- is_prerequisite: boolean (True if mastering Concept 1 is necessary before Concept 2)
- relationship_type: "strict" (cannot comprehend Concept 2 without Concept 1) or "soft" (helpful/reinforcing)
- weight: float from 0.1 to 1.0
- rationale: 1-sentence pedagogical justification"""
