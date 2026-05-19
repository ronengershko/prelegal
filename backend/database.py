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
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def upsert_user(name: str) -> dict:
    with _connect() as conn:
        conn.execute("INSERT OR IGNORE INTO users (name) VALUES (?)", (name,))
        row = conn.execute("SELECT * FROM users WHERE name = ?", (name,)).fetchone()
        return dict(row)
