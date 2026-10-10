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

FIGURE_PROMPT = """Analyze this academic figure or table. Return strict JSON with keys:
caption, description, structured_data. Include labels, relationships, equations, and values."""
SLIDE_PROMPT = """Analyze this lecture slide and return strict JSON with keys:
caption, description, structured_data. Ground the analysis in visible text and speaker notes."""
P1_FIGURE_PROMPT = FIGURE_PROMPT
P2_SLIDE_PROMPT = SLIDE_PROMPT
OCR_PROMPT = "OCR this page and return strict JSON with a text key containing all readable text."
P3_VIDEO_PROMPT = """Analyze this lecture video keyframe for study value. Return strict JSON with keys:
shows, visible_text, description, relationship_to_speech, useful_for_study.
Set useful_for_study=false for an uninformative talking-head frame. Describe diagrams,
slides, demonstrations, equations, charts, and other educational visuals precisely."""
P4_TAXONOMY_PROMPT = """Build a compact course taxonomy from the supplied digest. Return strict JSON:
{"topics":[{"name":"...","subtopics":[{"name":"...","concepts":[{"name":"...","description":"...","importance":0.0}]}]}]}.
Use at most 10 topics, 2-5 subtopics per topic, and 2-8 concepts per subtopic."""
P5_TAGGING_PROMPT = """Assign each content chunk only to concepts from the supplied taxonomy.
Return strict JSON {"tags":[{"chunk_id":"...","concept_id":"...","relevance":0.0,"role":"primary"}]}.
Use no invented IDs; return no tag when a chunk is unrelated."""
P6_PREREQUISITE_PROMPT = """Analyze the supplied concepts. Return strict JSON:
{"prerequisites":[{"concept_id":"...","prerequisite_id":"...","confidence":0.0,"rationale":"..."}],
"confusables":[{"concept_id":"...","related_concept_id":"...","label":"...","description":"...","confidence":0.0}]}.
Use only supplied IDs and do not create self-edges."""

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
