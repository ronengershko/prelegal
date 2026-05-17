"use client";

import { NDAFormData } from "@/lib/ndaGenerator";

interface Props {
  data: NDAFormData;
}

function val(v: string, fallback: string, cls = "nda-placeholder") {
  return v.trim() ? (
    <span>{v}</span>
  ) : (
    <span className={cls}>{fallback}</span>
  );
}

function formatDate(isoDate: string): React.ReactNode {
  if (!isoDate) return <span className="nda-placeholder">[Effective Date]</span>;
  const d = new Date(isoDate + "T00:00:00");
  return (
    <span>
      {d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-block">
      <span className="section-label">{title}</span>
      {children}
    </div>
  );
}

export default function NDAPreview({ data }: Props) {
  return (
    <div className="nda-preview">
      <h1>Mutual Non-Disclosure Agreement</h1>

      <p>
        This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists of: (1) this Cover
        Page (&ldquo;<strong>Cover Page</strong>&rdquo;) and (2) the Common Paper Mutual NDA
        Standard Terms Version 1.0 (&ldquo;<strong>Standard Terms</strong>&rdquo;) identical to
        those posted at{" "}
        <a
          href="https://commonpaper.com/standards/mutual-nda/1.0"
          className="text-brand-600 underline hover:text-brand-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          commonpaper.com/standards/mutual-nda/1.0
        </a>
        . Any modifications of the Standard Terms should be made on the Cover Page, which will
        control over conflicts with the Standard Terms.
      </p>

      <Section title="Purpose">
        <p>{val(data.purpose, "[How Confidential Information may be used]")}</p>
      </Section>

      <Section title="Effective Date">
        <p>{formatDate(data.effectiveDate)}</p>
      </Section>

      <Section title="MNDA Term">
        <p>
          {data.mndaTermType === "expires" ? (
            <>
              Expires {val(data.mndaTermDuration, "[duration]")} from Effective Date.
            </>
          ) : (
            "Continues until terminated in accordance with the terms of the MNDA."
          )}
        </p>
      </Section>

      <Section title="Term of Confidentiality">
        <p>
          {data.confidentialityTermType === "fixed" ? (
            <>
              {val(data.confidentialityDuration, "[duration]")} from Effective Date, but in the
              case of trade secrets until Confidential Information is no longer considered a trade
              secret under applicable laws.
            </>
          ) : (
            "In perpetuity."
          )}
        </p>
      </Section>

      <Section title="Governing Law & Jurisdiction">
        <p>Governing Law: {val(data.governingLaw, "[Fill in state]")}</p>
        <p>Jurisdiction: {val(data.jurisdiction, "[Fill in city or county and state]")}</p>
      </Section>

      <Section title="MNDA Modifications">
        <p>{val(data.modifications, "None.", "text-gray-400 italic")}</p>
      </Section>

      <p className="mt-6 text-xs text-gray-500 border-t border-gray-200 pt-4">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective
        Date.
      </p>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Party 1</th>
            <th>Party 2</th>
          </tr>
        </thead>
        <tbody>
          <tr className="signature-row">
            <td>Signature</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Print Name</td>
            <td>{val(data.party1Name, "")}</td>
            <td>{val(data.party2Name, "")}</td>
          </tr>
          <tr>
            <td>Title</td>
            <td>{val(data.party1Title, "")}</td>
            <td>{val(data.party2Title, "")}</td>
          </tr>
          <tr>
            <td>Company</td>
            <td>{val(data.party1Company, "")}</td>
            <td>{val(data.party2Company, "")}</td>
          </tr>
          <tr>
            <td>Notice Address</td>
            <td className="whitespace-pre-wrap">{val(data.party1Address, "")}</td>
            <td className="whitespace-pre-wrap">{val(data.party2Address, "")}</td>
          </tr>
          <tr className="signature-row">
            <td>Date</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <p className="mt-5 text-[11px] text-gray-400">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{" "}
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
    </div>
  );
}
