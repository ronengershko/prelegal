from contextlib import asynccontextmanager
from pathlib import Path

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from auth import create_token, decode_token, hash_password, verify_password
from chat import get_ai_response
from database import (
    create_user,
    delete_document,
    get_document,
    get_user_by_email,
    get_user_documents,
    init_db,
    save_document,
    update_document,
)

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

_bearer = HTTPBearer()


def current_user(creds: HTTPAuthorizationCredentials = Depends(_bearer)) -> dict:
    try:
        return decode_token(creds.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ── Auth ───────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/register")
def register(req: RegisterRequest):
    if not req.name.strip() or not req.email.strip() or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Name, email, and password (min 6 chars) required")
    if get_user_by_email(req.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = create_user(req.name.strip(), req.email.strip().lower(), hash_password(req.password))
    token = create_token(user["id"], user["name"], user["email"])
    return {"token": token, "name": user["name"]}


@app.post("/api/login")
def login(req: LoginRequest):
    user = get_user_by_email(req.email.strip().lower())
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["name"], user["email"])
    return {"token": token, "name": user["name"]}


# ── Chat ───────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict
    document_type: str = "mutual-nda"


@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        result = get_ai_response(
            [m.model_dump() for m in req.messages],
            req.current_fields,
            req.document_type,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="AI service unavailable")


# ── Documents ──────────────────────────────────────────────────────────────────

class SaveDocumentRequest(BaseModel):
    document_type: str
    title: str
    form_data: dict


@app.get("/api/documents")
def list_documents(user: dict = Depends(current_user)):
    docs = get_user_documents(int(user["sub"]))
    return {"documents": docs}


@app.post("/api/documents")
def create_document(req: SaveDocumentRequest, user: dict = Depends(current_user)):
    doc = save_document(int(user["sub"]), req.document_type, req.title, req.form_data)
    return doc


@app.put("/api/documents/{doc_id}")
def update_document_endpoint(doc_id: int, req: SaveDocumentRequest, user: dict = Depends(current_user)):
    doc = update_document(doc_id, int(user["sub"]), req.title, req.form_data)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@app.delete("/api/documents/{doc_id}")
def delete_document_endpoint(doc_id: int, user: dict = Depends(current_user)):
    if not delete_document(doc_id, int(user["sub"])):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"ok": True}


# ── Static frontend ────────────────────────────────────────────────────────────

static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
