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

### PL-7: Multi-user Auth and Document Persistence
- **Auth** (`backend/auth.py`): JWT (7-day expiry, HS256) + bcrypt password hashing via the `bcrypt` library directly (passlib dropped due to bcrypt≥4 incompatibility). `create_token` / `decode_token` / `hash_password` / `verify_password` helpers.
- **Database** (`backend/database.py`): `users` table (id, name, email UNIQUE, password_hash) and `documents` table (id, user_id FK, document_type, title, form_data JSON, created_at, updated_at). Full CRUD: `create_user`, `get_user_by_email`, `save_document`, `update_document`, `get_user_documents`, `get_document`, `delete_document`.
- **Auth endpoints** (`backend/main.py`): `POST /api/register` (name + email + password → JWT) and `POST /api/login` (email + password → JWT). `current_user` FastAPI dependency via `HTTPBearer` validates the token on all protected routes.
- **Document endpoints**: `GET /api/documents`, `POST /api/documents`, `PUT /api/documents/{id}`, `DELETE /api/documents/{id}` — all protected with JWT. Cross-user access returns 404.
- **Frontend auth** (`page.tsx`): Replaced fake name-only login with `AuthPage` component — Sign In / Register tab switcher. JWT stored as `prelegal_token` in localStorage; user name as `prelegal_user`. Auth headers passed to all document API calls.
- **Save button**: Header shows a Save button (floppy-disk icon). First save POSTs; subsequent saves PUT to the same `savedDocId`. Button briefly shows "Saved" on success.
- **My Documents panel**: Slide-in drawer from the right listing all saved documents (title, doc type, last-updated date). Clicking a document loads it in manual mode; trash icon deletes it.
- **No emojis**: Removed all emoji from `DocumentSelector.tsx`.
- **Draft disclaimer**: Amber banner at the bottom of every `DocumentPreview` — "Draft document — not legal advice."
- **Tests**: `backend/test_auth_documents.py` — 16 integration tests covering register, login, and document CRUD including cross-user isolation.

### PL-8: Final Polish + AI Conversation Bug Fix
- **AI bug fix** (`backend/documents.py`): Root cause was `_BASE_RULES` not requiring the model to follow up after acknowledging. Added two rules: always ask the next missing field in the same reply; never send an acknowledgement-only message unless all fields are complete.
- **Auto-save** (`page.tsx`): 2s debounced save on any `formData` change. Uses the same POST/PUT logic as the manual Save button. Only triggers when at least one field has content. Save button kept.
- **Unified header**: eliminated the copy-pasted duplicate header into a single conditional render.
- **Save button**: `bg-navy text-white` when unsaved → `bg-emerald-500` + CheckIcon when saved.
- **Auth page**: SpinnerIcon on submit loading, tagline added, reserved error slot to prevent layout shift.
- **My Documents panel**: slide-in + fade-in CSS animations (`globals.css` keyframes), SVG XIcon close button, spinner loading state, icon + copy empty state, fixed too-light date text.
- **Document selector**: equal card heights via `auto-rows-fr` + `flex-1` on description.
- **Chat bubbles**: AI messages use `bg-brand-50` tint; input placeholder changes to "AI is thinking…" while loading.
- **globals.css**: removed duplicate hand-rolled `animate-spin`; added `slideInFromRight` / `fadeIn` keyframes; section labels bumped from `text-[10px]` to `text-xs`.
- **tailwind.config**: added `brand-400` shade so `hover:border-brand-400` resolves correctly.

