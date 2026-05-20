"""Integration tests for PL-7: auth (register/login) and document CRUD endpoints."""
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    import database
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "test.db")
    database.init_db()
    return TestClient(app)


def register(client, name="Alice", email="alice@example.com", password="secret123"):
    return client.post("/api/register", json={"name": name, "email": email, "password": password})


def login(client, email="alice@example.com", password="secret123"):
    return client.post("/api/login", json={"email": email, "password": password})


# ── Register ───────────────────────────────────────────────────────────────────

class TestRegister:
    def test_register_success(self, client):
        res = register(client)
        assert res.status_code == 200
        data = res.json()
        assert "token" in data
        assert data["name"] == "Alice"

    def test_register_duplicate_email_returns_409(self, client):
        register(client)
        res = register(client)
        assert res.status_code == 409

    def test_register_short_password_returns_400(self, client):
        res = register(client, password="abc")
        assert res.status_code == 400

    def test_register_empty_name_returns_400(self, client):
        res = register(client, name="   ")
        assert res.status_code == 400


# ── Login ──────────────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_success(self, client):
        register(client)
        res = login(client)
        assert res.status_code == 200
        data = res.json()
        assert "token" in data
        assert data["name"] == "Alice"

    def test_login_wrong_password_returns_401(self, client):
        register(client)
        res = login(client, password="wrongpass")
        assert res.status_code == 401

    def test_login_unknown_email_returns_401(self, client):
        res = login(client, email="nobody@example.com")
        assert res.status_code == 401


# ── Documents ──────────────────────────────────────────────────────────────────

class TestDocuments:
    def _auth_headers(self, client):
        register(client)
        token = login(client).json()["token"]
        return {"Authorization": f"Bearer {token}"}

    def test_list_requires_auth(self, client):
        res = client.get("/api/documents")
        assert res.status_code == 401

    def test_list_empty_for_new_user(self, client):
        headers = self._auth_headers(client)
        res = client.get("/api/documents", headers=headers)
        assert res.status_code == 200
        assert res.json()["documents"] == []

    def test_create_document(self, client):
        headers = self._auth_headers(client)
        res = client.post("/api/documents", headers=headers, json={
            "document_type": "mutual-nda",
            "title": "Acme / Beta",
            "form_data": {"party1Company": "Acme", "party2Company": "Beta"},
        })
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "Acme / Beta"
        assert data["form_data"]["party1Company"] == "Acme"
        assert "id" in data

    def test_list_shows_created_document(self, client):
        headers = self._auth_headers(client)
        client.post("/api/documents", headers=headers, json={
            "document_type": "mutual-nda",
            "title": "My NDA",
            "form_data": {},
        })
        res = client.get("/api/documents", headers=headers)
        docs = res.json()["documents"]
        assert len(docs) == 1
        assert docs[0]["title"] == "My NDA"

    def test_update_document(self, client):
        headers = self._auth_headers(client)
        doc = client.post("/api/documents", headers=headers, json={
            "document_type": "mutual-nda",
            "title": "Old Title",
            "form_data": {},
        }).json()
        res = client.put(f"/api/documents/{doc['id']}", headers=headers, json={
            "document_type": "mutual-nda",
            "title": "New Title",
            "form_data": {"purpose": "Updated"},
        })
        assert res.status_code == 200
        assert res.json()["title"] == "New Title"
        assert res.json()["form_data"]["purpose"] == "Updated"

    def test_delete_document(self, client):
        headers = self._auth_headers(client)
        doc = client.post("/api/documents", headers=headers, json={
            "document_type": "csa",
            "title": "To Delete",
            "form_data": {},
        }).json()
        res = client.delete(f"/api/documents/{doc['id']}", headers=headers)
        assert res.status_code == 200
        assert res.json() == {"ok": True}
        remaining = client.get("/api/documents", headers=headers).json()["documents"]
        assert remaining == []

    def test_cannot_update_another_users_document(self, client):
        headers_alice = self._auth_headers(client)
        doc = client.post("/api/documents", headers=headers_alice, json={
            "document_type": "mutual-nda",
            "title": "Alice's doc",
            "form_data": {},
        }).json()

        register(client, name="Bob", email="bob@example.com")
        headers_bob = {"Authorization": f"Bearer {login(client, email='bob@example.com').json()['token']}"}

        res = client.put(f"/api/documents/{doc['id']}", headers=headers_bob, json={
            "document_type": "mutual-nda",
            "title": "Hijacked",
            "form_data": {},
        })
        assert res.status_code == 404

    def test_cannot_delete_another_users_document(self, client):
        headers_alice = self._auth_headers(client)
        doc = client.post("/api/documents", headers=headers_alice, json={
            "document_type": "mutual-nda",
            "title": "Alice's doc",
            "form_data": {},
        }).json()

        register(client, name="Bob", email="bob@example.com")
        headers_bob = {"Authorization": f"Bearer {login(client, email='bob@example.com').json()['token']}"}

        res = client.delete(f"/api/documents/{doc['id']}", headers=headers_bob)
        assert res.status_code == 404

    def test_update_nonexistent_document_returns_404(self, client):
        headers = self._auth_headers(client)
        res = client.put("/api/documents/9999", headers=headers, json={
            "document_type": "mutual-nda",
            "title": "Ghost",
            "form_data": {},
        })
        assert res.status_code == 404
