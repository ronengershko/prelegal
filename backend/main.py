from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from chat import get_ai_response
from database import init_db, upsert_user

load_dotenv(Path(__file__).parent.parent / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    name: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/login")
def login(req: LoginRequest):
    user = upsert_user(req.name)
    return {"id": user["id"], "name": user["name"]}


@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        result = get_ai_response(
            [m.model_dump() for m in req.messages],
            req.current_fields,
        )
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="AI service unavailable")


static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
