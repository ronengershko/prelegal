from typing import Optional, Literal

from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly legal assistant helping a user draft a Mutual NDA (Non-Disclosure Agreement).

Your job is to have a natural conversation to gather the information needed to fill in the document.
Ask about ONE topic per message. Be concise and conversational.
When the user provides information, extract it into the relevant fields.
Do not re-ask for fields that are already filled in current_fields.
When all fields are filled, congratulate the user and tell them they can download the PDF.

Fields to collect:
- party1Company, party1Name, party1Title, party1Address  (first party)
- party2Company, party2Name, party2Title, party2Address  (second party)
- purpose: reason for sharing confidential information
- effectiveDate: agreement start date (YYYY-MM-DD)
- mndaTermType: "expires" (fixed period) or "continues" (until terminated)
- mndaTermDuration: e.g. "1 year(s)" — only needed if mndaTermType is "expires"
- confidentialityTermType: "fixed" or "perpetual"
- confidentialityDuration: e.g. "1 year(s)" — only needed if confidentialityTermType is "fixed"
- governingLaw: state name, e.g. "Delaware"
- jurisdiction: city/county and state, e.g. "New Castle, DE"
- modifications: any changes to standard terms — omit/null if none

Start by greeting the user and asking for the two companies involved."""


class NDAFields(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "continues"]] = None
    mndaTermDuration: Optional[str] = None
    confidentialityTermType: Optional[Literal["fixed", "perpetual"]] = None
    confidentialityDuration: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None
    party1Company: Optional[str] = None
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Address: Optional[str] = None
    party2Company: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Address: Optional[str] = None


class ChatTurn(BaseModel):
    message: str
    fields: NDAFields


def get_ai_response(messages: list[dict], current_fields: dict) -> ChatTurn:
    system = SYSTEM_PROMPT + f"\n\ncurrent_fields: {current_fields}"
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
