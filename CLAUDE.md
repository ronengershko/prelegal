# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 12 document types via AI chat with full user authentication and document persistence.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## What has been implemented

### PL-4: V1 Technical Foundation
- **Backend**: FastAPI + uv project at `backend/`. SQLite DB initialised fresh on every container start (`database.py` with `init_db()`). Endpoints: `GET /api/health`, `POST /api/login`.
- **Frontend**: Next.js with `output: 'export'` (static build). Served by FastAPI in Docker. Fake login: user enters their name, stored in `localStorage` under key `prelegal_user`. Main app shows user name in header with a Sign out button.
- **Docker**: Multi-stage `Dockerfile` (Node build → Python serve). Single container at `http://localhost:8000`. `docker-compose.yml` loads `.env` via `env_file` (optional).
- **Scripts**: `scripts/start-{mac,linux}.sh`, `scripts/stop-{mac,linux}.sh`, `scripts/start-windows.ps1`, `scripts/stop-windows.ps1` — all wrap `docker compose up -d --build` / `docker compose down`.
- **Colors**: Tailwind config updated with project brand colors (`brand-500: #209dd7`, `navy: #032147`, `purple: #753991`, `accent: #ecad0a`).

### PL-5: AI Chat for Mutual NDA
- **Backend**: `backend/chat.py` — LiteLLM/Cerebras call with `ChatTurn` structured output (Pydantic: `message: str` + `NDAFields` with all 17 fields as Optional). `POST /api/chat` accepts `messages: list[ChatMessage]` + `current_fields: dict`, returns the AI reply and any newly extracted field values. Errors are caught and returned as HTTP 500. CORS enabled for `localhost:3000` (local dev). `python-dotenv` loads `.env` from project root.
- **Frontend**: `frontend/src/components/NDAChat.tsx` — chat UI with scrollable message list and text input. Fires an empty-history request on mount to get the AI's opening message. Each user message appends to history, calls `/api/chat`, merges non-null field updates into parent `formData` via `onFieldsUpdate`. Error state shows a Retry button that replays the last call using current `messages` state.
- **Toggle**: `page.tsx` has `mode: "chat" | "manual"` state. Left panel header shows an AI Chat / Manual pill toggle. Both `NDAChat` and `NDAForm` are always mounted; CSS `hidden` class toggles visibility so chat history is preserved when switching to Manual and back.
- **`NDAForm` unchanged** — switching to Manual shows the AI-populated fields fully editable.

### PL-6: Expand to All 12 Document Types
- **Document selector**: After login, `page.tsx` shows a 12-card grid (`DocumentSelector.tsx`). Selecting a card sets `selectedDocKey` state and initialises `formData` from the document's config defaults.
- **Document registry** (`backend/documents.py`): All 12 document types registered with per-document system prompts and ordered field lists. Keys: `mutual-nda`, `mutual-nda-coverpage`, `csa`, `design-partner`, `sla`, `psa`, `dpa`, `software-license`, `partnership`, `pilot`, `baa`, `ai-addendum`.
- **Generic ChatTurn** (`backend/chat.py`): Replaced NDA-specific `NDAFields` with `field_updates: list[FieldUpdate]` (key/value pairs) and `switch_to: Optional[str]`. `POST /api/chat` now accepts `document_type: str` and dispatches to the correct system prompt.
- **Document type switching**: If the user asks to switch to a different document mid-chat, the AI sets `switch_to` in its response. The frontend resets `formData`, `selectedDocKey`, and `mode` to `"chat"` accordingly. The AI also explains and suggests alternatives for any document type outside the supported 12.
- **TypeScript config** (`frontend/src/lib/documentTypes.ts`): `DocumentTypeConfig` defines per-document sections, field schemas (key, label, placeholder, type, choices, dependsOn), `party1Fields`/`party2Fields` signatory key mappings, and signature block config. All form data is `Record<string, string>`.
- **Generic components**: `DocumentChat.tsx` (replaces `NDAChat`), `DocumentForm.tsx` (config-driven dynamic form with radio/text/textarea/date fields and conditional field visibility), `DocumentPreview.tsx` (config-driven rich preview with populated signature block using correct party field keys per document).
- **PDF for all docs** (`pdfGenerator.ts`): `generateDocumentPDF(config, data)` renders title, intro, labelled sections, and a populated signature table using `party1Fields`/`party2Fields` key mappings. NDA still uses the original `generateAndDownloadPDF` for its custom section layout.
- **Tests**: `backend/test_documents.py` and `backend/test_api.py` — 23 unit and integration tests covering the document registry, `ChatTurn` model, and all API paths.


