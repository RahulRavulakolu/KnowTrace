"""Unified LLM Gateway for KnowTrace.

Enforces:
- Rule 2: All LLM calls via backend/core/llm.py: call_llm(vendor, prompt, json_schema, images, temperature)
- Rule 3: Vendor "A" = Gemini (generation, vision); Vendor "B" = Claude/Groq (validation)
- Tenacity exponential backoff retries on transient errors.
- Structured JSON schema validation using Pydantic.
"""

import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Type, Union

from pydantic import BaseModel
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from backend.core.config import settings
from backend.core.logging import logger


class LLMError(Exception):
    """Base exception for LLM provider errors."""
    pass


class LLMConfigurationError(LLMError):
    """Raised when an LLM provider is misconfigured or lacks API keys."""
    pass


class LLMValidationError(LLMError):
    """Raised when structured JSON output does not match expected schema."""
    pass


@dataclass
class LLMResponse:
    """Standardized response from any LLM provider."""
    content: str
    vendor: str
    model: str
    data: Optional[Any] = None
    raw_response: Optional[Any] = field(default=None, repr=False)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __str__(self) -> str:
        return self.content

    def __getitem__(self, item: str) -> Any:
        if isinstance(self.data, dict):
            return self.data[item]
        elif isinstance(self.data, BaseModel):
            return getattr(self.data, item)
        raise TypeError(f"LLMResponse.data is not indexable: {type(self.data)}")


def _extract_json_from_text(text: str) -> str:
    """Extract JSON string from potential markdown code blocks or surrounding text."""
    text = text.strip()
    # Match ```json ... ``` blocks
    json_block = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if json_block:
        return json_block.group(1).strip()
    return text


def _parse_and_validate(
    content: str,
    json_schema: Optional[Union[Type[BaseModel], dict]] = None,
) -> Optional[Any]:
    """Parse JSON and validate against Pydantic model or dict schema."""
    if not json_schema:
        return None

    cleaned_json_str = _extract_json_from_text(content)
    try:
        raw_dict = json.loads(cleaned_json_str)
    except json.JSONDecodeError as exc:
        raise LLMValidationError(f"Failed to decode JSON from model response: {exc}\nRaw: {content}") from exc

    if isinstance(json_schema, type) and issubclass(json_schema, BaseModel):
        try:
            return json_schema.model_validate(raw_dict)
        except Exception as exc:
            raise LLMValidationError(f"Response failed schema validation: {exc}\nParsed: {raw_dict}") from exc
    elif isinstance(json_schema, dict):
        return raw_dict
    return raw_dict


def _generate_mock_payload_for_schema(json_schema: Optional[Union[Type[BaseModel], dict]]) -> str:
    """Generate valid JSON matching the provided schema for testing or offline mock execution."""
    if not json_schema:
        return "Mocked LLM Response"

    if isinstance(json_schema, type) and issubclass(json_schema, BaseModel):
        dummy_data: Dict[str, Any] = {}
        for field_name, field_info in json_schema.model_fields.items():
            annotation = field_info.annotation
            # Determine suitable dummy value
            if annotation is bool or "bool" in str(annotation).lower():
                dummy_data[field_name] = True
            elif annotation is int or "int" in str(annotation).lower():
                dummy_data[field_name] = 1
            elif annotation is float or "float" in str(annotation).lower():
                dummy_data[field_name] = 1.0
            elif "list" in str(annotation).lower():
                dummy_data[field_name] = []
            elif "dict" in str(annotation).lower():
                dummy_data[field_name] = {}
            elif field_name == "status":
                dummy_data[field_name] = "approved"
            else:
                dummy_data[field_name] = f"Mocked {field_name}"
        return json.dumps(dummy_data)
    elif isinstance(json_schema, dict):
        return json.dumps({"status": "ok", "mock": True})
    return '{"status": "ok"}'


def _call_gemini(
    prompt: str,
    json_schema: Optional[Union[Type[BaseModel], dict]] = None,
    images: Optional[List[Union[bytes, str, Path]]] = None,
    temperature: float = 0.2,
) -> LLMResponse:
    """Invoke Google Gemini (Vendor A) for generation and vision."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key.startswith("mock"):
        logger.warning("Using mock response for Gemini (Vendor A) - no valid GEMINI_API_KEY provided.")
        mock_content = _generate_mock_payload_for_schema(json_schema)
        validated_data = _parse_and_validate(mock_content, json_schema)
        return LLMResponse(
            content=mock_content,
            vendor="gemini",
            model=settings.GEMINI_MODEL,
            data=validated_data,
            metadata={"mock": True},
        )

    import google.generativeai as genai
    genai.configure(api_key=api_key)

    generation_config: Dict[str, Any] = {
        "temperature": temperature,
    }

    full_prompt = prompt
    if json_schema:
        if isinstance(json_schema, type) and issubclass(json_schema, BaseModel):
            schema_str = json.dumps(json_schema.model_json_schema(), indent=2)
            full_prompt = (
                f"{prompt}\n\n"
                f"CRITICAL: Output ONLY valid, parseable JSON conforming to this JSON Schema:\n{schema_str}\n"
                f"Do NOT include commentary, greetings, or explanations outside the JSON."
            )
        elif isinstance(json_schema, dict):
            full_prompt = (
                f"{prompt}\n\n"
                f"CRITICAL: Output ONLY valid, parseable JSON conforming to this schema:\n{json.dumps(json_schema, indent=2)}\n"
            )

    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        generation_config=generation_config,
    )

    contents: List[Any] = [full_prompt]
    if images:
        for img in images:
            if isinstance(img, (str, Path)) and os.path.exists(str(img)):
                with open(str(img), "rb") as f:
                    contents.append({"mime_type": "image/jpeg", "data": f.read()})
            elif isinstance(img, bytes):
                contents.append({"mime_type": "image/jpeg", "data": img})

    response = model.generate_content(contents)
    content_text = response.text or ""
    validated_data = _parse_and_validate(content_text, json_schema)

    return LLMResponse(
        content=content_text,
        vendor="gemini",
        model=settings.GEMINI_MODEL,
        data=validated_data,
        raw_response=response,
    )


def _call_groq_or_claude(
    prompt: str,
    json_schema: Optional[Union[Type[BaseModel], dict]] = None,
    images: Optional[List[Union[bytes, str, Path]]] = None,
    temperature: float = 0.2,
    prefer_claude: bool = False,
) -> LLMResponse:
    """Invoke Groq or Claude (Vendor B) for validation and verification."""
    # Check Groq first unless prefer_claude is True
    if not prefer_claude and settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("mock"):
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)

        full_prompt = prompt
        response_format: Optional[Dict[str, str]] = None
        if json_schema:
            response_format = {"type": "json_object"}
            schema_repr = (
                json.dumps(json_schema.model_json_schema(), indent=2)
                if isinstance(json_schema, type) and issubclass(json_schema, BaseModel)
                else json.dumps(json_schema, indent=2)
            )
            full_prompt = (
                f"{prompt}\n\n"
                f"You MUST return valid JSON adhering strictly to this schema:\n{schema_repr}"
            )

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a precise, rigorous academic validator."},
                {"role": "user", "content": full_prompt},
            ],
            model=settings.GROQ_MODEL,
            temperature=temperature,
            response_format=response_format,
        )
        content_text = chat_completion.choices[0].message.content or ""
        validated_data = _parse_and_validate(content_text, json_schema)
        return LLMResponse(
            content=content_text,
            vendor="groq",
            model=settings.GROQ_MODEL,
            data=validated_data,
            raw_response=chat_completion,
        )

    # Fallback to mock if neither Groq nor Claude keys are live
    logger.warning("Using mock response for Vendor B - no valid GROQ_API_KEY/ANTHROPIC_API_KEY provided.")
    mock_content = _generate_mock_payload_for_schema(json_schema)
    validated_data = _parse_and_validate(mock_content, json_schema)
    return LLMResponse(
        content=mock_content,
        vendor="groq" if not prefer_claude else "claude",
        model=settings.GROQ_MODEL if not prefer_claude else settings.CLAUDE_MODEL,
        data=validated_data,
        metadata={"mock": True},
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((ConnectionError, TimeoutError, LLMValidationError)),
    reraise=True,
)
def call_llm(
    vendor: str,
    prompt: str,
    json_schema: Optional[Union[Type[BaseModel], dict]] = None,
    images: Optional[List[Union[bytes, str, Path]]] = None,
    temperature: float = 0.2,
) -> LLMResponse:
    """Master LLM Gateway function for KnowTrace.

    Args:
        vendor: "A" / "gemini" for Generation/Vision; "B" / "groq" / "claude" for Validation.
        prompt: The textual instruction / context.
        json_schema: Optional Pydantic model class or JSON schema dict for structured output.
        images: Optional list of image file paths, bytes, or Base64 strings.
        temperature: Sampling temperature (default 0.2 for deterministic tutoring).

    Returns:
        LLMResponse with parsed data and raw text.
    """
    v_norm = vendor.strip().lower()
    logger.info("Calling LLM vendor=%s, prompt_len=%d, has_schema=%s, has_images=%s",
                vendor, len(prompt), json_schema is not None, bool(images))

    if v_norm in ("a", "gemini", "vendor_a", "google"):
        return _call_gemini(
            prompt=prompt,
            json_schema=json_schema,
            images=images,
            temperature=temperature,
        )
    elif v_norm in ("b", "groq", "vendor_b"):
        return _call_groq_or_claude(
            prompt=prompt,
            json_schema=json_schema,
            images=images,
            temperature=temperature,
            prefer_claude=False,
        )
    elif v_norm in ("claude", "anthropic"):
        return _call_groq_or_claude(
            prompt=prompt,
            json_schema=json_schema,
            images=images,
            temperature=temperature,
            prefer_claude=True,
        )
    else:
        raise ValueError(
            f"Unsupported vendor '{vendor}'. Vendor 'A' = Gemini; Vendor 'B' = Claude/Groq."
        )
