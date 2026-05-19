"use client";

import { useState, useEffect, useRef } from "react";
import { NDAFormData } from "@/lib/ndaGenerator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  formData: NDAFormData;
  onFieldsUpdate: (fields: Partial<NDAFormData>) => void;
}

export default function NDAChat({ formData, onFieldsUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sendToAI([]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendToAI(msgs: Message[]) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, current_fields: formData }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages([...msgs, { role: "assistant", content: data.message }]);
      const updates = Object.fromEntries(
        Object.entries(data.fields).filter(([, v]) => v !== null && v !== undefined)
      );
      if (Object.keys(updates).length > 0) {
        onFieldsUpdate(updates as Partial<NDAFormData>);
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
    sendToAI(next);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
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
                onClick={() => sendToAI(messages)}
                className="font-semibold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2">
        <input
          className="form-input flex-1"
          placeholder="Type your reply…"
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
