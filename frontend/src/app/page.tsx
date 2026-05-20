"use client";

import { useState, useEffect } from "react";
import DocumentSelector from "@/components/DocumentSelector";
import DocumentChat from "@/components/DocumentChat";
import DocumentForm from "@/components/DocumentForm";
import DocumentPreview from "@/components/DocumentPreview";
import { DOCUMENT_TYPES, defaultFormData, FormData } from "@/lib/documentTypes";

interface AuthUser {
  name: string;
  token: string;
}

interface SavedDocument {
  id: number;
  document_type: string;
  title: string;
  form_data: Record<string, string>;
  updated_at: string;
}

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("prelegal_token");
    const name = localStorage.getItem("prelegal_user");
    if (token && name) setUser({ token, name });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!user) {
    return (
      <AuthPage
        onAuth={(name, token) => {
          localStorage.setItem("prelegal_token", token);
          localStorage.setItem("prelegal_user", name);
          setUser({ name, token });
        }}
      />
    );
  }

  return (
    <App
      user={user}
      onSignOut={() => {
        localStorage.removeItem("prelegal_token");
        localStorage.removeItem("prelegal_user");
        setUser(null);
      }}
    />
  );
}

// ── Auth ────────────────────────────────────────────────────────────────────────

function AuthPage({ onAuth }: { onAuth: (name: string, token: string) => void }) {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchTab(t: "signin" | "register") {
    setTab(t);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = tab === "signin" ? "/api/login" : "/api/register";
      const body = tab === "signin" ? { email, password } : { name, email, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      onAuth(data.name, data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    email.trim() && password.trim() && (tab === "signin" || name.trim());

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 border border-brand-100">
            <ScalesIcon className="h-6 w-6 text-brand-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-navy mb-6">PreLegal</h1>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-semibold mb-6">
          <button
            onClick={() => switchTab("signin")}
            className={`flex-1 py-2 transition-colors ${
              tab === "signin" ? "bg-brand-500 text-white" : "bg-white text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab("register")}
            className={`flex-1 py-2 transition-colors border-l border-gray-200 ${
              tab === "register" ? "bg-brand-500 text-white" : "bg-white text-gray-400 hover:text-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "register" && (
            <input
              className="form-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}
          <input
            className="form-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={tab === "signin"}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-lg bg-purple px-4 py-2.5 text-sm font-semibold text-white
              hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple/50
              disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "…" : tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────────

function App({ user, onSignOut }: { user: AuthUser; onSignOut: () => void }) {
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<"chat" | "manual">("chat");
  const [savedDocId, setSavedDocId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState<"Save" | "Saved">("Save");
  const [docsOpen, setDocsOpen] = useState(false);
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const config = selectedDocKey ? DOCUMENT_TYPES[selectedDocKey] : null;

  function authHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  async function loadDocuments() {
    setDocsLoading(true);
    try {
      const res = await fetch("/api/documents", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } finally {
      setDocsLoading(false);
    }
  }

  function openMyDocs() {
    setDocsOpen(true);
    loadDocuments();
  }

  function handleSelectDoc(key: string) {
    setSelectedDocKey(key);
    setFormData(defaultFormData(DOCUMENT_TYPES[key]));
    setMode("chat");
    setSavedDocId(null);
    setSaveLabel("Save");
  }

  function handleDocumentSwitch(key: string) {
    const newConfig = DOCUMENT_TYPES[key];
    if (!newConfig) return;
    setSelectedDocKey(key);
    setFormData(defaultFormData(newConfig));
    setMode("chat");
    setSavedDocId(null);
    setSaveLabel("Save");
  }

  function handleLoadDoc(doc: SavedDocument) {
    const docConfig = DOCUMENT_TYPES[doc.document_type];
    if (!docConfig) return;
    setSelectedDocKey(doc.document_type);
    setFormData(doc.form_data as FormData);
    setSavedDocId(doc.id);
    setSaveLabel("Save");
    setMode("manual");
    setDocsOpen(false);
  }

  async function handleDeleteDoc(id: number) {
    await fetch(`/api/documents/${id}`, { method: "DELETE", headers: authHeaders() });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  function deriveTitle(): string {
    const p1 =
      formData["party1Company"] ||
      formData["provider_name"] ||
      formData["company_name"] ||
      "";
    const p2 =
      formData["party2Company"] ||
      formData["customer_name"] ||
      formData["partner_name"] ||
      "";
    if (p1 && p2) return `${p1} / ${p2}`;
    if (p1 || p2) return p1 || p2;
    return config?.name ?? "Untitled";
  }

  async function handleSave() {
    if (!config || !selectedDocKey) return;
    setIsSaving(true);
    try {
      const body = {
        document_type: selectedDocKey,
        title: deriveTitle(),
        form_data: formData,
      };
      const res = savedDocId
        ? await fetch(`/api/documents/${savedDocId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(body),
          })
        : await fetch("/api/documents", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(body),
          });
      if (res.ok) {
        const data = await res.json();
        setSavedDocId(data.id);
        setSaveLabel("Saved");
        setTimeout(() => setSaveLabel("Save"), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadPDF() {
    if (!config) return;
    setIsGenerating(true);
    try {
      if (selectedDocKey === "mutual-nda" || selectedDocKey === "mutual-nda-coverpage") {
        const { generateAndDownloadPDF } = await import("@/lib/pdfGenerator");
        const ndaData = {
          purpose: formData.purpose ?? "",
          effectiveDate: formData.effectiveDate ?? "",
          mndaTermType: (formData.mndaTermType as "expires" | "continues") ?? "expires",
          mndaTermDuration: formData.mndaTermDuration ?? "",
          confidentialityTermType:
            (formData.confidentialityTermType as "fixed" | "perpetual") ?? "fixed",
          confidentialityDuration: formData.confidentialityDuration ?? "",
          governingLaw: formData.governingLaw ?? "",
          jurisdiction: formData.jurisdiction ?? "",
          modifications: formData.modifications ?? "",
          party1Company: formData.party1Company ?? "",
          party1Name: formData.party1Name ?? "",
          party1Title: formData.party1Title ?? "",
          party1Address: formData.party1Address ?? "",
          party2Company: formData.party2Company ?? "",
          party2Name: formData.party2Name ?? "",
          party2Title: formData.party2Title ?? "",
          party2Address: formData.party2Address ?? "",
        };
        await generateAndDownloadPDF(ndaData);
      } else {
        const { generateDocumentPDF } = await import("@/lib/pdfGenerator");
        await generateDocumentPDF(config, formData);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const headerRight = (
    <div className="flex items-center gap-3">
      <button
        onClick={openMyDocs}
        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500
          hover:text-brand-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-brand-50"
      >
        <FolderIcon className="h-4 w-4" />
        My Documents
      </button>
      <span className="hidden sm:block text-sm text-gray-500">{user.name}</span>
      <button
        onClick={onSignOut}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Sign out
      </button>
    </div>
  );

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
                <ScalesIcon className="h-5 w-5 text-brand-500" />
              </div>
              <span className="text-base font-bold text-navy tracking-tight">PreLegal</span>
            </div>
            {headerRight}
          </div>
        </header>
        <DocumentSelector onSelect={handleSelectDoc} />
        {docsOpen && (
          <MyDocsPanel
            documents={documents}
            loading={docsLoading}
            onLoad={handleLoadDoc}
            onDelete={handleDeleteDoc}
            onClose={() => setDocsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <ScalesIcon className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <button
                onClick={() => setSelectedDocKey(null)}
                className="text-base font-bold text-navy tracking-tight hover:text-brand-600 transition-colors"
              >
                PreLegal
              </button>
              <span className="hidden sm:inline ml-2 text-sm text-gray-400 font-medium">
                {config.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDocKey(null)}
              className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← All documents
            </button>
            <button
              onClick={openMyDocs}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500
                hover:text-brand-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-brand-50"
            >
              <FolderIcon className="h-4 w-4" />
              My Documents
            </button>
            <span className="hidden sm:block text-sm text-gray-500">{user.name}</span>
            <button
              onClick={onSignOut}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm
                focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors
                ${saveLabel === "Saved"
                  ? "bg-emerald-500 text-white focus:ring-emerald-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400"
                }`}
            >
              {isSaving ? (
                <SpinnerIcon className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              {isSaving ? "Saving…" : saveLabel}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm
                hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left panel — chat or form */}
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sticky top-[4.5rem]"
            style={{ height: "calc(100vh - 7rem)" }}
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-none">
              <div>
                <h2 className="text-sm font-semibold text-gray-800 tracking-tight">
                  {mode === "chat" ? "AI Assistant" : "Agreement Details"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {mode === "chat"
                    ? "Chat to fill in your document."
                    : "Fill in the fields — the document updates in real time."}
                </p>
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => setMode("chat")}
                  className={`px-3 py-1.5 transition-colors ${
                    mode === "chat" ? "bg-brand-500 text-white" : "bg-white text-gray-400 hover:text-gray-600"
                  }`}
                >
                  AI Chat
                </button>
                <button
                  onClick={() => setMode("manual")}
                  className={`px-3 py-1.5 transition-colors border-l border-gray-200 ${
                    mode === "manual" ? "bg-brand-500 text-white" : "bg-white text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            <div className={mode === "chat" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
              <DocumentChat
                formData={formData}
                documentType={selectedDocKey!}
                onFieldsUpdate={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                onDocumentSwitch={handleDocumentSwitch}
              />
            </div>
            <div className={mode === "manual" ? "flex-1 overflow-y-auto px-6 py-5" : "hidden"}>
              <DocumentForm config={config} data={formData} onChange={setFormData} />
            </div>
          </div>

          {/* Preview panel */}
          <div className="sticky top-[4.5rem] flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-gray-700">Document Preview</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                Live
              </span>
            </div>
            <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-slate-200/60 p-4">
              <div
                className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.06)] rounded-sm mx-auto overflow-auto"
                style={{ maxHeight: "calc(100vh - 13rem)" }}
              >
                <div className="px-10 py-10">
                  <DocumentPreview config={config} data={formData} />
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">
              <span className="text-blue-400 font-medium">Blue text</span> = unfilled fields
            </p>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-4">
        <p className="text-center text-xs text-gray-400">
          Legal templates based on{" "}
          <a
            href="https://commonpaper.com"
            className="underline hover:text-gray-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Common Paper
          </a>{" "}
          —{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="underline hover:text-gray-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
        </p>
      </footer>

      {docsOpen && (
        <MyDocsPanel
          documents={documents}
          loading={docsLoading}
          onLoad={handleLoadDoc}
          onDelete={handleDeleteDoc}
          onClose={() => setDocsOpen(false)}
        />
      )}
    </div>
  );
}

// ── My Documents Panel ──────────────────────────────────────────────────────────

function MyDocsPanel({
  documents,
  loading,
  onLoad,
  onDelete,
  onClose,
}: {
  documents: SavedDocument[];
  loading: boolean;
  onLoad: (doc: SavedDocument) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-navy">My Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-center text-sm text-gray-400 mt-8">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-8">No saved documents yet.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => {
                const config = DOCUMENT_TYPES[doc.document_type];
                return (
                  <li
                    key={doc.id}
                    className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                  >
                    <button
                      onClick={() => onLoad(doc)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm font-semibold text-navy truncate">{doc.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{config?.name ?? doc.document_type}</p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {new Date(doc.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="flex-none text-xs text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────────────

function ScalesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 3a1 1 0 0 1 .961.726l1.78 6.322H19.5a1 1 0 0 1 0 2h-.96l1.574 4.723A1 1 0 0 1 19.17 18H14.83a1 1 0 0 1-.944-1.329L15.46 12H12.78l-1.78 6.322A1 1 0 0 1 10 19H4.83a1 1 0 0 1-.944-1.329L5.46 13H4.5a1 1 0 0 1 0-2h5.759l1.78-6.274A1 1 0 0 1 12 3Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h8.086a2.5 2.5 0 0 1 1.768.732l2.914 2.914A2.5 2.5 0 0 1 18 7.414V15.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 15.5v-11ZM10 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM7 4.5v1A1.5 1.5 0 0 0 8.5 7h3A1.5 1.5 0 0 0 13 5.5v-1h-6Z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 4a2 2 0 0 1 2-2h3.586a1 1 0 0 1 .707.293L9.707 3.707A1 1 0 0 0 10.414 4H16a2 2 0 0 1 2 2v1H2V4ZM2 8v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8H2Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 3.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}
