from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import init_db, upsert_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


class LoginRequest(BaseModel):
    name: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/login")
def login(req: LoginRequest):
    user = upsert_user(req.name)
    return {"id": user["id"], "name": user["name"]}


static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
