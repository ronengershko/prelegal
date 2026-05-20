"use client";

import { useState, useEffect, useRef } from "react";
import { FormData } from "@/lib/documentTypes";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  formData: FormData;
  documentType: string;
  onFieldsUpdate: (fields: Record<string, string>) => void;
  onDocumentSwitch: (docTypeKey: string) => void;
}

export default function DocumentChat({ formData, documentType, onFieldsUpdate, onDocumentSwitch }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    sendToAI([], formData, documentType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendToAI(msgs: Message[], currentFields: FormData, docType: string) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          current_fields: currentFields,
          document_type: docType,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages([...msgs, { role: "assistant", content: data.message }]);

      if (data.field_updates?.length > 0) {
        const updates: Record<string, string> = {};
        for (const { key, value } of data.field_updates) {
          if (value !== null && value !== undefined) {
            updates[key] = value;
          }
        }
        if (Object.keys(updates).length > 0) onFieldsUpdate(updates);
      }

      if (data.switch_to) {
        onDocumentSwitch(data.switch_to);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setInput("");
    sendToAI(next, formData, documentType);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-500 text-white rounded-br-sm"
                  : "bg-brand-50 text-gray-800 border border-brand-100 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3.5">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
              Something went wrong.
              <button
                onClick={() => sendToAI(messages, formData, documentType)}
                className="font-semibold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2">
        <input
          className="form-input flex-1 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
          placeholder={loading ? "AI is thinking…" : "Type your reply…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="rounded-lg bg-purple px-4 py-2 text-sm font-semibold text-white
            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Send
        </button>
      </div>
    </div>
  );
}
