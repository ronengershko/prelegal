"""Tests for document registry and chat models."""
import pytest
from documents import DOCUMENTS, SUPPORTED_DOCS_SUMMARY
from chat import ChatTurn, FieldUpdate


EXPECTED_DOC_KEYS = {
    "mutual-nda", "mutual-nda-coverpage", "csa", "design-partner",
    "sla", "psa", "dpa", "software-license", "partnership", "pilot",
    "baa", "ai-addendum",
}


class TestDocumentRegistry:
    def test_all_12_documents_present(self):
        assert set(DOCUMENTS.keys()) == EXPECTED_DOC_KEYS

    def test_each_document_has_name(self):
        for key, doc in DOCUMENTS.items():
            assert doc.name, f"{key} missing name"

    def test_each_document_has_system_prompt(self):
        for key, doc in DOCUMENTS.items():
            assert len(doc.system_prompt) > 50, f"{key} system prompt too short"

    def test_each_document_has_fields(self):
        for key, doc in DOCUMENTS.items():
            assert len(doc.fields) > 0, f"{key} has no fields"

    def test_all_document_keys_referenced_in_switch_instruction(self):
        for key in EXPECTED_DOC_KEYS:
            assert key in SUPPORTED_DOCS_SUMMARY, f"{key} missing from SUPPORTED_DOCS_SUMMARY"

    def test_mutual_nda_fields(self):
        doc = DOCUMENTS["mutual-nda"]
        for field in ("party1Company", "party1Name", "purpose", "effectiveDate",
                      "mndaTermType", "governingLaw", "jurisdiction"):
            assert field in doc.fields

    def test_csa_fields(self):
        doc = DOCUMENTS["csa"]
        for field in ("provider_name", "customer_name", "effective_date",
                      "governing_law", "subscription_period", "payment_process"):
            assert field in doc.fields

    def test_baa_fields(self):
        doc = DOCUMENTS["baa"]
        for field in ("provider_name", "company_name", "baa_effective_date",
                      "breach_notification_period"):
            assert field in doc.fields

    def test_ai_addendum_fields(self):
        doc = DOCUMENTS["ai-addendum"]
        for field in ("provider_name", "customer_name", "training_restrictions"):
            assert field in doc.fields

    def test_document_config_key_matches_dict_key(self):
        for key, doc in DOCUMENTS.items():
            assert doc.key == key, f"Config key mismatch: {doc.key!r} != {key!r}"


class TestChatTurn:
    def test_chat_turn_basic(self):
        turn = ChatTurn(message="Hello")
        assert turn.message == "Hello"
        assert turn.field_updates == []
        assert turn.switch_to is None

    def test_chat_turn_with_field_updates(self):
        updates = [
            FieldUpdate(key="purpose", value="Business evaluation"),
            FieldUpdate(key="effectiveDate", value="2024-01-01"),
        ]
        turn = ChatTurn(message="Got it", field_updates=updates)
        assert len(turn.field_updates) == 2
        assert turn.field_updates[0].key == "purpose"
        assert turn.field_updates[0].value == "Business evaluation"

    def test_chat_turn_with_null_field_value(self):
        turn = ChatTurn(
            message="Hi",
            field_updates=[FieldUpdate(key="modifications", value=None)],
        )
        assert turn.field_updates[0].value is None

    def test_chat_turn_switch_to(self):
        turn = ChatTurn(message="Sure, switching to CSA", switch_to="csa")
        assert turn.switch_to == "csa"

    def test_chat_turn_json_roundtrip(self):
        original = ChatTurn(
            message="What is the purpose?",
            field_updates=[FieldUpdate(key="party1Company", value="Acme")],
            switch_to=None,
        )
        json_str = original.model_dump_json()
        restored = ChatTurn.model_validate_json(json_str)
        assert restored.message == original.message
        assert restored.field_updates[0].key == "party1Company"
        assert restored.field_updates[0].value == "Acme"
