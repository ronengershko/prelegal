# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 11 document types via AI chat with full user authentication and document persistence.

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


