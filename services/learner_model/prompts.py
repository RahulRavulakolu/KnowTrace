"""Prompt templates for Learner Modeling and Misconception Diagnosis Service.

Rule 4: Every prompt lives in services/<module>/prompts.py, never inline.
"""

# Misconception diagnosis from student attempts
MISCONCEPTION_DIAGNOSIS_PROMPT = """You are a cognitive learning scientist.
A learner answered an assessment question incorrectly.
Diagnose the cognitive misconception that led to this error.

QUESTION:
{question_text}

CORRECT ANSWER:
{correct_answer}

EXPLANATION:
{explanation}

STUDENT SELECTED ANSWER:
{student_answer}

SOURCE REFERENCE:
\"\"\"{source_chunk}\"\"\"

Provide a diagnosis JSON with:
- label: Short descriptive title of the misconception (e.g., "Conflating Velocity with Acceleration")
- description: Detailed explanation of what faulty premise or mental model caused this choice
- pattern_signature: Distractor pattern identifier
- suggested_remediation_focus: Specific topic or sub-concept the learner needs to review."""

# Adaptive remediation plan generation
REMEDIATION_PLAN_PROMPT = """You are an adaptive study planner.
A learner has demonstrated low mastery (p_know={p_know:.2f}) on concept '{concept_name}'.
Identified misconceptions: {misconceptions}
Available prerequisite concepts: {prerequisites}

Synthesize a targeted, bite-sized study plan:
1. Prioritize reviewing foundational prerequisite chunks.
2. Address the specific misconception with an interactive check question.
3. Suggest a 15-minute focused review session."""
