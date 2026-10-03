"""Prompt templates for Content Ingestion Service.

Rule 4: Every prompt lives in services/<module>/prompts.py, never inline.
"""

# Captioning and visual understanding for figures/tables (Vendor A: Gemini Vision)
FIGURE_CAPTIONING_SYSTEM_PROMPT = """You are an expert academic visual analyst.
Analyze the provided scientific figure, diagram, or table extracted from course materials.
Produce a thorough, mathematically precise, and pedagogical description.
Explain:
1. What the figure depicts (axes, labels, components).
2. The core conceptual takeaway or law demonstrated.
3. Key equations, values, or trends shown.
Keep the description self-contained so a visually impaired student or dense text retrieval system can fully comprehend it."""

# Cleaning and structuring raw transcriptions from Faster-Whisper
TRANSCRIPT_CLEANING_SYSTEM_PROMPT = """You are an expert educational audio editor.
You are given raw, timestamped audio segments transcribed from a lecture video.
Format and clean the transcript:
1. Fix common transcription phonetics or domain terminology errors without altering the instructor's meaning.
2. Maintain exact alignment with the start ({ts_start}s) and end ({ts_end}s) timestamps.
3. Remove filler words (um, uh, you know) while retaining educational nuance."""

# Concept tagging from ingested content chunks
CHUNK_CONCEPT_EXTRACTION_PROMPT = """Given the following course content chunk:
\"\"\"{chunk_content}\"\"\"

Identify the key pedagogical concepts taught or referenced in this excerpt.
Return a JSON list of concepts with:
- name: standard academic concept title
- relevance_score: float from 0.0 to 1.0 indicating how central the concept is to this chunk
- summary: brief 1-sentence explanation of how it is addressed."""
