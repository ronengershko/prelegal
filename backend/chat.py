from typing import Optional

from litellm import completion
from pydantic import BaseModel

from documents import DOCUMENTS

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


class FieldUpdate(BaseModel):
    key: str
    value: Optional[str] = None


class ChatTurn(BaseModel):
    message: str
    field_updates: list[FieldUpdate] = []
    switch_to: Optional[str] = None


def get_ai_response(messages: list[dict], current_fields: dict, document_type: str) -> ChatTurn:
    config = DOCUMENTS.get(document_type)
    if config is None:
        raise ValueError(f"Unknown document_type: {document_type!r}")
    system = config.system_prompt + f"\n\ncurrent_fields: {current_fields}"
    full_messages = [{"role": "system", "content": system}] + messages
    response = completion(
        model=MODEL,
        messages=full_messages,
        response_format=ChatTurn,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    content = response.choices[0].message.content
    if not content:
        raise ValueError("Model returned no content")
    return ChatTurn.model_validate_json(content)
