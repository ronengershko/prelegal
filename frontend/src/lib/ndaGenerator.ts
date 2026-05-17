export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "continues";
  mndaTermDuration: string;
  confidentialityTermType: "fixed" | "perpetual";
  confidentialityDuration: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1Company: string;
  party1Name: string;
  party1Title: string;
  party1Address: string;
  party2Company: string;
  party2Name: string;
  party2Title: string;
  party2Address: string;
}

export const defaultFormData: NDAFormData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: new Date().toISOString().split("T")[0],
  mndaTermType: "expires",
  mndaTermDuration: "1 year(s)",
  confidentialityTermType: "fixed",
  confidentialityDuration: "1 year(s)",
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1Company: "",
  party1Name: "",
  party1Title: "",
  party1Address: "",
  party2Company: "",
  party2Name: "",
  party2Title: "",
  party2Address: "",
};

function orBlank(value: string, placeholder: string): string {
  return value.trim() || placeholder;
}

function formatDate(isoDate: string): string {
  if (!isoDate) return "[Effective Date]";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function generateNDAMarkdown(data: NDAFormData): string {
  const effectiveDate = formatDate(data.effectiveDate);

  const mndaTermLine =
    data.mndaTermType === "expires"
      ? `Expires ${orBlank(data.mndaTermDuration, "[duration]")} from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confidentialityLine =
    data.confidentialityTermType === "fixed"
      ? `${orBlank(data.confidentialityDuration, "[duration]")} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  return `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

### Purpose
${orBlank(data.purpose, "[Purpose of disclosure]")}

### Effective Date
${effectiveDate}

### MNDA Term
${mndaTermLine}

### Term of Confidentiality
${confidentialityLine}

### Governing Law & Jurisdiction
Governing Law: ${orBlank(data.governingLaw, "[State]")}

Jurisdiction: ${orBlank(data.jurisdiction, "[City or county and state]")}

### MNDA Modifications
${data.modifications.trim() || "None."}

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

| | PARTY 1 | PARTY 2 |
|:--- | :--- | :--- |
| **Signature** | | |
| **Print Name** | ${orBlank(data.party1Name, "")} | ${orBlank(data.party2Name, "")} |
| **Title** | ${orBlank(data.party1Title, "")} | ${orBlank(data.party2Title, "")} |
| **Company** | ${orBlank(data.party1Company, "")} | ${orBlank(data.party2Company, "")} |
| **Notice Address** | ${orBlank(data.party1Address, "")} | ${orBlank(data.party2Address, "")} |
| **Date** | | |

---

*Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
`;
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
