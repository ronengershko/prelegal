"""Integration tests for the chat API endpoint."""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from main import app
from chat import ChatTurn, FieldUpdate


@pytest.fixture
def client():
    return TestClient(app)


def make_chat_turn(message: str, field_updates=None, switch_to=None) -> ChatTurn:
    return ChatTurn(
        message=message,
        field_updates=field_updates or [],
        switch_to=switch_to,
    )


class TestHealthEndpoint:
    def test_health(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.json() == {"status": "ok"}


class TestChatEndpoint:
    def test_chat_requires_messages(self, client):
        res = client.post("/api/chat", json={})
        assert res.status_code == 422

    @patch("main.get_ai_response")
    def test_chat_default_doc_type_is_mutual_nda(self, mock_ai, client):
        mock_ai.return_value = make_chat_turn("Hello! What companies are involved?")
        client.post("/api/chat", json={"messages": [], "current_fields": {}})
        _, _, doc_type = mock_ai.call_args[0]
        assert doc_type == "mutual-nda"

    @patch("main.get_ai_response")
    def test_chat_passes_document_type(self, mock_ai, client):
        mock_ai.return_value = make_chat_turn("Hi there!")
        client.post("/api/chat", json={
            "messages": [],
            "current_fields": {},
            "document_type": "csa",
        })
        _, _, doc_type = mock_ai.call_args[0]
        assert doc_type == "csa"

    @patch("main.get_ai_response")
    def test_chat_returns_message_and_field_updates(self, mock_ai, client):
        mock_ai.return_value = make_chat_turn(
            "Great! What's the purpose?",
            field_updates=[FieldUpdate(key="party1Company", value="Acme Corp")],
        )
        res = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": "Acme Corp and Beta Inc"}],
            "current_fields": {},
            "document_type": "mutual-nda",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["message"] == "Great! What's the purpose?"
        assert data["field_updates"][0]["key"] == "party1Company"
        assert data["field_updates"][0]["value"] == "Acme Corp"

    @patch("main.get_ai_response")
    def test_chat_returns_switch_to(self, mock_ai, client):
        mock_ai.return_value = make_chat_turn(
            "Sure, switching to Cloud Service Agreement!",
            switch_to="csa",
        )
        res = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": "I want a CSA instead"}],
            "current_fields": {},
            "document_type": "mutual-nda",
        })
        assert res.status_code == 200
        assert res.json()["switch_to"] == "csa"

    @patch("main.get_ai_response")
    def test_chat_500_on_ai_error(self, mock_ai, client):
        mock_ai.side_effect = Exception("AI unavailable")
        res = client.post("/api/chat", json={
            "messages": [],
            "current_fields": {},
        })
        assert res.status_code == 500

    @patch("main.get_ai_response")
    def test_all_document_types_accepted(self, mock_ai, client):
        mock_ai.return_value = make_chat_turn("Hello!")
        doc_types = [
            "mutual-nda", "mutual-nda-coverpage", "csa", "design-partner",
            "sla", "psa", "dpa", "software-license", "partnership",
            "pilot", "baa", "ai-addendum",
        ]
        for doc_type in doc_types:
            res = client.post("/api/chat", json={
                "messages": [],
                "current_fields": {},
                "document_type": doc_type,
            })
            assert res.status_code == 200, f"Failed for doc_type={doc_type}"
