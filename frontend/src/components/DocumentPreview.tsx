"use client";

import { DocumentTypeConfig, FieldConfig, FormData } from "@/lib/documentTypes";

interface Props {
  config: DocumentTypeConfig;
  data: FormData;
}

function Placeholder({ text }: { text: string }) {
  return <span className="nda-placeholder">[{text}]</span>;
}

function FieldValue({ field, data }: { field: FieldConfig; data: FormData }) {
  const raw = data[field.key] ?? "";

  if (field.type === "choice" && field.choices) {
    const match = field.choices.find((c) => c.value === raw);
    if (!raw) return <Placeholder text={field.label} />;
    return <span>{match?.label ?? raw}</span>;
  }

  if (field.type === "date") {
    if (!raw) return <Placeholder text={field.label} />;
    const d = new Date(raw + "T00:00:00");
    return <span>{d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>;
  }

  if (!raw.trim()) {
    if (field.optional) return <span className="text-gray-400 italic">None</span>;
    return <Placeholder text={field.label} />;
  }

  return <span className="whitespace-pre-wrap">{raw}</span>;
}

function SignatureBlock({ config, data }: { config: DocumentTypeConfig; data: FormData }) {
  const p1Label = config.party1Label ?? "Party 1";
  const p2Label = config.party2Label ?? "Party 2";
  const p1 = config.party1Fields ?? {};
  const p2 = config.party2Fields ?? {};

  function cell(key: string | undefined) {
    if (!key) return <span className="text-gray-300">—</span>;
    const v = data[key] ?? "";
    return v ? <span className="whitespace-pre-wrap">{v}</span> : <span className="text-gray-300">—</span>;
  }

  const rows = [
    { label: "Name", k1: p1.name, k2: p2.name },
    { label: "Title", k1: p1.title, k2: p2.title },
    { label: "Company", k1: p1.company, k2: p2.company },
    { label: "Notice Address", k1: p1.address, k2: p2.address },
  ].filter(({ k1, k2 }) => k1 || k2);

  return (
    <>
      <p className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-4">
        By signing below, each party agrees to enter into this agreement as of the Effective Date.
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>{p1Label}</th>
            <th>{p2Label}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="signature-row">
            <td>Signature</td>
            <td></td>
            <td></td>
          </tr>
          {rows.map(({ label, k1, k2 }) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{cell(k1)}</td>
              <td>{cell(k2)}</td>
            </tr>
          ))}
          <tr className="signature-row">
            <td>Date</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default function DocumentPreview({ config, data }: Props) {
  return (
    <div className="nda-preview">
      <h1>{config.name}</h1>
      <p className="text-sm text-gray-600 leading-relaxed">{config.intro}</p>

      {config.sections.map((section) => (
        <div key={section.title} className="section-block mt-6">
          <span className="section-label">{section.title}</span>
          <div className="space-y-2 mt-2">
            {section.fields.map((field) => {
              const isDependencyUnmet =
                field.dependsOn && data[field.dependsOn.key] !== field.dependsOn.value;
              if (isDependencyUnmet) return null;

              return (
                <div key={field.key} className="text-sm">
                  <span className="font-medium text-gray-700">{field.label}: </span>
                  <FieldValue field={field} data={data} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {config.hasSignatureBlock && <SignatureBlock config={config} data={data} />}

      {config.sourceUrl && (
        <p className="mt-5 text-[11px] text-gray-400">
          Based on{" "}
          <a
            href={config.sourceUrl}
            className="text-brand-500 underline hover:text-brand-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {config.sourceName ?? config.sourceUrl}
          </a>{" "}
          — free to use under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="text-brand-500 underline hover:text-brand-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          .
        </p>
      )}
    </div>
  );
}
