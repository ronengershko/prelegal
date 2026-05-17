"use client";

import { useState } from "react";
import NDAForm from "@/components/NDAForm";
import NDAPreview from "@/components/NDAPreview";
import { NDAFormData, defaultFormData } from "@/lib/ndaGenerator";

export default function Home() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownloadPDF() {
    setIsGenerating(true);
    try {
      const { generateAndDownloadPDF } = await import("@/lib/pdfGenerator");
      await generateAndDownloadPDF(formData);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <ScalesIcon className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <span className="text-base font-bold text-brand-600 tracking-tight">PreLegal</span>
              <span className="hidden sm:inline ml-2 text-sm text-gray-400 font-medium">
                Mutual NDA Creator
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
              hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
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
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Form panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h2 className="text-sm font-semibold text-gray-800 tracking-tight">
                Agreement Details
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Fill in the fields — the document updates in real time.
              </p>
            </div>
            <div className="px-6 py-5">
              <NDAForm data={formData} onChange={setFormData} />
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

            {/* Paper */}
            <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-slate-200/60 p-4">
              <div
                className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.06)] rounded-sm mx-auto overflow-auto"
                style={{ maxHeight: "calc(100vh - 13rem)" }}
              >
                <div className="px-10 py-10">
                  <NDAPreview data={formData} />
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
          Based on{" "}
          <a
            href="https://commonpaper.com/standards/mutual-nda/1.0"
            className="underline hover:text-gray-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Common Paper Mutual NDA v1.0
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
    </div>
  );
}

function ScalesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12 3a1 1 0 0 1 .961.726l1.78 6.322H19.5a1 1 0 0 1 0 2h-.96l1.574 4.723A1 1 0 0 1 19.17 18H14.83a1 1 0 0 1-.944-1.329L15.46 12H12.78l-1.78 6.322A1 1 0 0 1 10 19H4.83a1 1 0 0 1-.944-1.329L5.46 13H4.5a1 1 0 0 1 0-2h5.759l1.78-6.274A1 1 0 0 1 12 3Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
