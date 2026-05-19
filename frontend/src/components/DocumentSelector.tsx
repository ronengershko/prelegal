"use client";

import { DOCUMENT_TYPES } from "@/lib/documentTypes";

interface Props {
  onSelect: (docTypeKey: string) => void;
}

const DOC_ICONS: Record<string, string> = {
  "mutual-nda": "🤝",
  "mutual-nda-coverpage": "📋",
  "csa": "☁️",
  "design-partner": "🎨",
  "sla": "📊",
  "psa": "💼",
  "dpa": "🔒",
  "software-license": "💿",
  "partnership": "🤝",
  "pilot": "🚀",
  "baa": "🏥",
  "ai-addendum": "🤖",
};

export default function DocumentSelector({ onSelect }: Props) {
  const docs = Object.values(DOCUMENT_TYPES);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-navy mb-2">Choose a Document Type</h1>
          <p className="text-gray-500 text-sm">
            Select the legal agreement you want to draft. Our AI will guide you through the process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <button
              key={doc.key}
              onClick={() => onSelect(doc.key)}
              className="group text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5
                hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-none mt-0.5 select-none" aria-hidden>
                  {DOC_ICONS[doc.key] ?? "📄"}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-navy group-hover:text-brand-600 transition-colors leading-snug">
                    {doc.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {doc.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
