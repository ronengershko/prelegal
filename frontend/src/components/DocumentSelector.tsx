"use client";

import { DOCUMENT_TYPES } from "@/lib/documentTypes";

interface Props {
  onSelect: (docTypeKey: string) => void;
}

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
              <h3 className="text-sm font-semibold text-navy group-hover:text-brand-600 transition-colors leading-snug">
                {doc.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-3">
                {doc.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
