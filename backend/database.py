import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "prelegal.db"


def _connect():
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                document_type TEXT NOT NULL,
                title TEXT NOT NULL,
                form_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


# ── Users ──────────────────────────────────────────────────────────────────────

def create_user(name: str, email: str, password_hash: str) -> dict:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, password_hash),
        )
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row)


def get_user_by_email(email: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row) if row else None


# ── Documents ──────────────────────────────────────────────────────────────────

def save_document(user_id: int, document_type: str, title: str, form_data: dict) -> dict:
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO documents (user_id, document_type, title, form_data)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, document_type, title, json.dumps(form_data)),
        )
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _doc_row(row)


def update_document(doc_id: int, user_id: int, title: str, form_data: dict) -> dict | None:
    with _connect() as conn:
        conn.execute(
            """
            UPDATE documents
            SET title = ?, form_data = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
            """,
            (title, json.dumps(form_data), doc_id, user_id),
        )
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, user_id)
        ).fetchone()
        return _doc_row(row) if row else None


def get_user_documents(user_id: int) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,),
        ).fetchall()
        return [_doc_row(r) for r in rows]


def get_document(doc_id: int, user_id: int) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, user_id)
        ).fetchone()
        return _doc_row(row) if row else None


def delete_document(doc_id: int, user_id: int) -> bool:
    with _connect() as conn:
        cursor = conn.execute(
            "DELETE FROM documents WHERE id = ? AND user_id = ?", (doc_id, user_id)
        )
        return cursor.rowcount > 0


def _doc_row(row: sqlite3.Row) -> dict:
    d = dict(row)
    d["form_data"] = json.loads(d["form_data"])
    return d
