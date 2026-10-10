"""Video ingestion: speech transcription, scene keyframes, and visual analysis."""

import math
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Iterable

from backend.core.config import settings
from backend.core.db import SessionLocal
from backend.core.llm import call_llm
from backend.core.logging import logger
from backend.models.db import ContentChunk, Source
from services.ingestion.embed import embed_chunks
from services.ingestion.prompts import P3_VIDEO_PROMPT

_whisper_model: Any = None


def _model() -> Any:
    """Load Faster-Whisper lazily so API startup does not load model weights."""
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel

        _whisper_model = WhisperModel(
            settings.ASR_MODEL,
            device="auto",
            compute_type=settings.ASR_COMPUTE_TYPE,
        )
    return _whisper_model


def _value(item: Any, name: str, default: Any = None) -> Any:
    """Read a field from either Faster-Whisper objects or test dictionaries."""
    if isinstance(item, dict):
        return item.get(name, default)
    return getattr(item, name, default)


def _duration(video_path: Path) -> float | None:
    """Return media duration using ffprobe when available."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)],
            check=True, capture_output=True, text=True, timeout=30,
        )
        return float(result.stdout.strip())
    except (OSError, ValueError, subprocess.SubprocessError):
        return None


def _word_confidence(word: Any, segment: Any) -> float:
    """Convert Faster-Whisper word probability/log probability into [0, 1]."""
    probability = _value(word, "probability")
    if probability is not None:
        return max(0.0, min(1.0, float(probability)))
    logprob = _value(word, "avg_logprob", _value(segment, "avg_logprob", 0.0))
    return max(0.0, min(1.0, math.exp(float(logprob))))


def _transcript_windows(segments: Iterable[Any]) -> list[dict[str, Any]]:
    """Group timestamped words into 30-60 second, sentence-aware windows."""
    words: list[tuple[float, float, str, float]] = []
    for segment in segments:
        segment_words = _value(segment, "words") or []
        if segment_words:
            for word in segment_words:
                text = str(_value(word, "word", "")).strip()
                if text:
                    words.append((
                        float(_value(word, "start", _value(segment, "start", 0.0))),
                        float(_value(word, "end", _value(segment, "end", 0.0))),
                        text,
                        _word_confidence(word, segment),
                    ))
        else:
            text = str(_value(segment, "text", "")).strip()
            if text:
                words.append((
                    float(_value(segment, "start", 0.0)),
                    float(_value(segment, "end", 0.0)),
                    text,
                    _word_confidence(segment, segment),
                ))

    windows: list[dict[str, Any]] = []
    current: list[tuple[float, float, str, float]] = []
    for word in words:
        current.append(word)
        elapsed = word[1] - current[0][0]
        sentence_end = bool(re.search(r"[.!?][\"')\]]?$", word[2]))
        if elapsed >= 30.0 and (sentence_end or elapsed >= 60.0):
            windows.append(_window(current))
            current = []
    if current:
        windows.append(_window(current))
    return windows


def _window(words: list[tuple[float, float, str, float]]) -> dict[str, Any]:
    """Build one transcript chunk from normalized word tuples."""
    confidence = sum(word[3] for word in words) / len(words)
    low_words = [word[2] for word in words if word[3] < 0.5]
    meta: dict[str, Any] = {}
    if low_words:
        meta["low_asr_confidence"] = True
        meta["low_confidence_words"] = low_words
    return {
        "text": " ".join(word[2] for word in words).strip(),
        "modality": "transcript",
        "ts_start": words[0][0],
        "ts_end": words[-1][1],
        "extraction_confidence": confidence,
        "meta": meta,
    }


def extract_audio_transcript(
    video_path: str | Path, course_id: str, source_id: str
) -> list[dict[str, Any]]:
    """Extract mono 16 kHz audio and return timestamped transcript windows."""
    del course_id, source_id
    path = Path(video_path)
    duration = _duration(path)
    if duration is not None and duration > settings.MAX_VIDEO_DURATION:
        raise ValueError(
            f"Video duration {duration:.1f}s exceeds the {settings.MAX_VIDEO_DURATION}s limit"
        )
    with tempfile.TemporaryDirectory(prefix="knowtrace-audio-") as directory:
        wav_path = Path(directory) / "audio.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000",
             "-c:a", "pcm_s16le", str(wav_path)],
            check=True, capture_output=True, timeout=600,
        )
        segments, _ = _model().transcribe(
            str(wav_path), word_timestamps=True, vad_filter=True
        )
        return _transcript_windows(segments)


def extract_keyframes(
    video_path: str | Path, max_frames: int = 60, source_id: str | None = None
) -> list[tuple[float, str]]:
    """Detect scene changes and extract one JPEG frame per selected scene."""
    path = Path(video_path)
    resolved_source = source_id or path.stem
    output_dir = Path(settings.DATA_DIR) / "processed" / resolved_source
    output_dir.mkdir(parents=True, exist_ok=True)
    from scenedetect import ContentDetector, SceneManager, open_video

    video = open_video(str(path))
    manager = SceneManager()
    manager.add_detector(ContentDetector(threshold=settings.SCENE_THRESHOLD))
    manager.detect_scenes(video=video)
    scenes = manager.get_scene_list()
    timestamps = [scene[0].get_seconds() for scene in scenes]
    if not timestamps:
        timestamps = [0.0]
    if len(timestamps) > max_frames:
        step = len(timestamps) / max_frames
        timestamps = [timestamps[min(int(index * step), len(timestamps) - 1)]
                      for index in range(max_frames)]

    frames: list[tuple[float, str]] = []
    for index, timestamp in enumerate(timestamps, start=1):
        frame_path = output_dir / f"frame_{index}_{timestamp:.3f}.jpg"
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-ss", f"{timestamp:.3f}", "-i", str(path),
                 "-frames:v", "1", "-q:v", "2", str(frame_path)],
                check=True, capture_output=True, timeout=120,
            )
            frames.append((timestamp, str(frame_path)))
        except (OSError, subprocess.SubprocessError) as exc:
            logger.warning("Could not extract keyframe %.3fs from %s: %s", timestamp, path, exc)
    return frames


def process_keyframes(
    keyframes: list[tuple[float, str]],
    course_id: str,
    source_id: str,
    transcript_chunks: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Analyze useful keyframes and associate them with nearby speech."""
    schema = {
        "type": "object",
        "properties": {
            "shows": {"type": "string"},
            "visible_text": {"type": "string"},
            "description": {"type": "string"},
            "relationship_to_speech": {"type": "string"},
            "useful_for_study": {"type": "boolean"},
        },
    }
    figures: list[dict[str, Any]] = []
    for timestamp, frame_path in keyframes:
        window = next(
            (item for item in transcript_chunks
             if item.get("ts_start", 0.0) <= timestamp <= item.get("ts_end", 0.0)),
            min(transcript_chunks, key=lambda item: abs(
                float(item.get("ts_start", 0.0)) - timestamp
            ), default={}),
        )
        speech = str(window.get("text", ""))
        try:
            response = call_llm(
                "A", f"{P3_VIDEO_PROMPT}\nTimestamp: {timestamp:.3f}\nSpeech: {speech}",
                json_schema=schema, images=[frame_path],
            )
            visual = response.data if isinstance(response.data, dict) else {}
        except Exception as exc:
            logger.warning("Video keyframe analysis failed at %.3fs: %s", timestamp, exc)
            continue
        if visual.get("useful_for_study") is False:
            continue
        description = str(visual.get("description") or "")
        visible_text = str(visual.get("visible_text") or "")
        figures.append({
            "course_id": course_id,
            "source_id": source_id,
            "text": " ".join(part for part in (description, visible_text, speech) if part).strip(),
            "modality": "figure",
            "ts_start": timestamp,
            "ts_end": float(window.get("ts_end", timestamp)),
            "visual": {**visual, "image_uri": frame_path, "timestamp": timestamp},
            "extraction_confidence": 0.85,
            "meta": {},
        })
    return figures


def _persist(db: Any, chunks: list[dict[str, Any]]) -> None:
    """Persist chunks while storing transient metadata inside visual JSON."""
    for chunk in embed_chunks(chunks):
        values = dict(chunk)
        meta = values.pop("meta", {})
        visual = dict(values.get("visual") or {})
        if meta:
            visual["meta"] = meta
        values["visual"] = visual
        db.add(ContentChunk(**values))


def ingest_video(video_path: str | Path, course_id: str, source_id: str) -> list[dict[str, Any]]:
    """Run video ingestion with transcript-first persistence and resumable progress."""
    db = SessionLocal()
    source = db.get(Source, source_id)
    if source is None:
        db.close()
        raise ValueError(f"Source {source_id} does not exist")
    try:
        if source.status == "done":
            return []
        source.status, source.stage, source.progress = "processing", "transcribe", 0.0
        db.commit()
        transcript = extract_audio_transcript(video_path, course_id, source_id)
        if not transcript:
            raise ValueError("No speech text was extracted from video")
        db.query(ContentChunk).filter(ContentChunk.source_id == source_id).delete()
        _persist(db, transcript)
        db.commit()
        source.progress = 0.25
        source.stage = "scenes"
        db.commit()
        keyframes = extract_keyframes(video_path, settings.MAX_FRAMES, source_id)
        source.progress = 0.5
        source.stage = "vision"
        db.commit()
        figures = process_keyframes(keyframes, course_id, source_id, transcript)
        source.progress = 0.75
        source.stage = "embed"
        db.commit()
        _persist(db, figures)
        source.progress, source.stage, source.status = 1.0, "done", "done"
        db.commit()
        return transcript + figures
    except Exception as exc:
        db.rollback()
        source.status, source.stage, source.error_message = "failed", "failed", str(exc)
        db.commit()
        logger.exception("Video ingestion failed for %s", source_id)
        raise
    finally:
        db.close()
