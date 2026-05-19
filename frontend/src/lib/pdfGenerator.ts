import type { NDAFormData } from "./ndaGenerator";
import type { DocumentTypeConfig, FieldConfig, FormData } from "./documentTypes";

function or(v: string, fallback: string): string {
  return v.trim() || fallback;
}

function formatDate(isoDate: string): string {
  if (!isoDate) return "Effective Date";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateAndDownloadPDF(data: NDAFormData): Promise<void> {
  // Lazy-load to keep initial bundle lean
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();   // 595.28 pt
  const pageH = doc.internal.pageSize.getHeight();  // 841.89 pt
  const ML = 72;
  const MR = 72;
  const MT = 72;
  const MB = 72;
  const contentW = pageW - ML - MR;
  let y = MT;

  // Gray palette
  const GRAY_700: [number, number, number] = [55, 65, 81];
  const GRAY_500: [number, number, number] = [107, 114, 128];
  const GRAY_300: [number, number, number] = [209, 213, 219];
  const GRAY_200: [number, number, number] = [229, 231, 235];
  const GRAY_100: [number, number, number] = [243, 244, 246];
  const GRAY_50:  [number, number, number] = [249, 250, 251];
  const BLACK:    [number, number, number] = [17, 24, 39];

  function checkPage(needed: number) {
    if (y + needed > pageH - MB) {
      doc.addPage();
      y = MT;
    }
  }

  function lh(size: number, multiplier = 1.4) {
    return size * multiplier;
  }

  // ── Title ──────────────────────────────────────────────
  doc.setFontSize(17);
  doc.setFont("times", "bold");
  doc.setTextColor(...BLACK);
  doc.text("Mutual Non-Disclosure Agreement", pageW / 2, y, { align: "center" });
  y += lh(17) + 12;

  // ── Intro paragraph ──────────────────────────────────────
  const intro =
    'This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ' +
    '("Cover Page") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ' +
    '("Standard Terms") identical to those posted at commonpaper.com/standards/mutual-nda/1.0. ' +
    "Any modifications of the Standard Terms should be made on the Cover Page, which will " +
    "control over conflicts with the Standard Terms.";

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.setTextColor(...GRAY_700);
  const introLines = doc.splitTextToSize(intro, contentW);
  checkPage(introLines.length * lh(10));
  doc.text(introLines, ML, y);
  y += introLines.length * lh(10) + 4;

  // ── Section helper ──────────────────────────────────────
  function section(title: string, paragraphs: string[]) {
    const estLines = paragraphs.reduce(
      (acc, p) => acc + doc.splitTextToSize(p, contentW).length,
      0
    );
    checkPage(36 + estLines * lh(10));

    y += 8;
    doc.setDrawColor(...GRAY_300);
    doc.setLineWidth(0.5);
    doc.line(ML, y, pageW - MR, y);
    y += 9;

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY_500);
    doc.text(title.toUpperCase(), ML, y);
    y += 13;

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.setTextColor(...GRAY_700);
    for (const p of paragraphs) {
      const lines = doc.splitTextToSize(p, contentW);
      doc.text(lines, ML, y);
      y += lines.length * lh(10) + 3;
    }
  }

  // ── Sections ─────────────────────────────────────────────
  section("Purpose", [
    or(
      data.purpose,
      "Evaluating whether to enter into a business relationship with the other party."
    ),
  ]);

  section("Effective Date", [formatDate(data.effectiveDate)]);

  section("MNDA Term", [
    data.mndaTermType === "expires"
      ? `Expires ${or(data.mndaTermDuration, "[duration]")} from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.",
  ]);

  section("Term of Confidentiality", [
    data.confidentialityTermType === "fixed"
      ? `${or(data.confidentialityDuration, "[duration]")} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.",
  ]);

  section("Governing Law & Jurisdiction", [
    `Governing Law: ${or(data.governingLaw, "[Fill in state]")}`,
    `Jurisdiction: ${or(data.jurisdiction, "[Fill in city or county and state]")}`,
  ]);

  section("MNDA Modifications", [data.modifications.trim() || "None."]);

  // ── Signing note ─────────────────────────────────────────
  checkPage(50);
  y += 10;
  doc.setDrawColor(...GRAY_200);
  doc.setLineWidth(0.5);
  doc.line(ML, y, pageW - MR, y);
  y += 14;

  doc.setFontSize(9);
  doc.setFont("times", "italic");
  doc.setTextColor(...GRAY_500);
  const signingNote =
    "By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.";
  const noteLines = doc.splitTextToSize(signingNote, contentW);
  doc.text(noteLines, ML, y);
  y += noteLines.length * lh(9) + 12;

  // ── Signature table ───────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    tableWidth: contentW,
    head: [["", "PARTY 1", "PARTY 2"]],
    body: [
      ["Signature", "\n\n", "\n\n"],
      ["Print Name", or(data.party1Name, ""), or(data.party2Name, "")],
      ["Title", or(data.party1Title, ""), or(data.party2Title, "")],
      ["Company", or(data.party1Company, ""), or(data.party2Company, "")],
      ["Notice Address", or(data.party1Address, ""), or(data.party2Address, "")],
      ["Date", "\n\n", "\n\n"],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      lineColor: GRAY_300,
      lineWidth: 0.5,
      textColor: BLACK,
      valign: "top",
    },
    headStyles: {
      fillColor: GRAY_100,
      textColor: BLACK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    columnStyles: {
      0: {
        fillColor: GRAY_50,
        fontStyle: "bold",
        fontSize: 8,
        cellWidth: 90,
        textColor: GRAY_700,
      },
    },
    alternateRowStyles: { fillColor: false },
    rowPageBreak: "avoid",
  });

  // ── Footer ───────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableEndY: number = (doc as any).lastAutoTable?.finalY ?? y + 160;
  const footerY = tableEndY + 20;

  checkPage(20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_300);
  doc.text(
    "Common Paper Mutual Non-Disclosure Agreement (Version 1.0) — CC BY 4.0",
    pageW / 2,
    footerY,
    { align: "center" }
  );

  // ── Save ─────────────────────────────────────────────────
  const p1 = data.party1Company.trim() || "Party1";
  const p2 = data.party2Company.trim() || "Party2";
  doc.save(`Mutual-NDA_${p1}_${p2}.pdf`.replace(/\s+/g, "-"));
}

function resolveFieldValue(field: FieldConfig, data: FormData): string {
  const raw = data[field.key] ?? "";
  if (field.type === "date") {
    if (!raw) return "";
    const d = new Date(raw + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  if (field.type === "choice" && field.choices) {
    const match = field.choices.find((c) => c.value === raw);
    return match?.label ?? raw;
  }
  return raw;
}

export async function generateDocumentPDF(config: DocumentTypeConfig, data: FormData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const ML = 72;
  const MR = 72;
  const MT = 72;
  const MB = 72;
  const contentW = pageW - ML - MR;
  let y = MT;

  const GRAY_700: [number, number, number] = [55, 65, 81];
  const GRAY_500: [number, number, number] = [107, 114, 128];
  const GRAY_300: [number, number, number] = [209, 213, 219];
  const GRAY_200: [number, number, number] = [229, 231, 235];
  const GRAY_100: [number, number, number] = [243, 244, 246];
  const GRAY_50:  [number, number, number] = [249, 250, 251];
  const BLACK:    [number, number, number] = [17, 24, 39];

  function checkPage(needed: number) {
    if (y + needed > pageH - MB) { doc.addPage(); y = MT; }
  }
  function lh(size: number, mult = 1.4) { return size * mult; }

  // Title
  doc.setFontSize(17);
  doc.setFont("times", "bold");
  doc.setTextColor(...BLACK);
  doc.text(config.name, pageW / 2, y, { align: "center" });
  y += lh(17) + 12;

  // Intro
  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.setTextColor(...GRAY_700);
  const introLines = doc.splitTextToSize(config.intro, contentW);
  checkPage(introLines.length * lh(10));
  doc.text(introLines, ML, y);
  y += introLines.length * lh(10) + 4;

  function renderSection(title: string, rows: { label: string; value: string }[]) {
    const totalLines = rows.reduce(
      (acc, r) => acc + Math.max(1, doc.splitTextToSize(r.value || "—", contentW - 110).length),
      0
    );
    checkPage(36 + totalLines * lh(10));

    y += 8;
    doc.setDrawColor(...GRAY_300);
    doc.setLineWidth(0.5);
    doc.line(ML, y, pageW - MR, y);
    y += 9;

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY_500);
    doc.text(title.toUpperCase(), ML, y);
    y += 13;

    for (const { label, value } of rows) {
      const display = value || "—";
      checkPage(lh(10) + 6);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY_700);
      doc.text(label + ":", ML, y);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...BLACK);
      const valLines = doc.splitTextToSize(display, contentW - 110);
      doc.text(valLines, ML + 110, y);
      y += Math.max(1, valLines.length) * lh(10) + 2;
    }
  }

  // Sections
  for (const section of config.sections) {
    const rows: { label: string; value: string }[] = [];
    for (const field of section.fields) {
      const isDependencyUnmet =
        field.dependsOn && data[field.dependsOn.key] !== field.dependsOn.value;
      if (isDependencyUnmet) continue;
      rows.push({ label: field.label, value: resolveFieldValue(field, data) });
    }
    if (rows.length > 0) renderSection(section.title, rows);
  }

  // Signature block
  if (config.hasSignatureBlock) {
    checkPage(50);
    y += 10;
    doc.setDrawColor(...GRAY_200);
    doc.setLineWidth(0.5);
    doc.line(ML, y, pageW - MR, y);
    y += 14;

    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.setTextColor(...GRAY_500);
    const noteLines = doc.splitTextToSize(
      "By signing below, each party agrees to enter into this agreement as of the Effective Date.",
      contentW
    );
    doc.text(noteLines, ML, y);
    y += noteLines.length * lh(9) + 12;

    const p1Label = config.party1Label ?? "Party 1";
    const p2Label = config.party2Label ?? "Party 2";

    const p1f = config.party1Fields ?? {};
    const p2f = config.party2Fields ?? {};
    function fv(key: string | undefined) { return key ? (data[key] ?? "") : ""; }

    const sigRows: string[][] = [["Signature", "\n\n", "\n\n"]];
    if (p1f.name || p2f.name) sigRows.push(["Name", fv(p1f.name), fv(p2f.name)]);
    if (p1f.title || p2f.title) sigRows.push(["Title", fv(p1f.title), fv(p2f.title)]);
    if (p1f.company || p2f.company) sigRows.push(["Company", fv(p1f.company), fv(p2f.company)]);
    if (p1f.address || p2f.address) sigRows.push(["Notice Address", fv(p1f.address), fv(p2f.address)]);
    sigRows.push(["Date", "\n\n", "\n\n"]);

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      tableWidth: contentW,
      head: [["", p1Label.toUpperCase(), p2Label.toUpperCase()]],
      body: sigRows,
      styles: {
        font: "helvetica", fontSize: 9, cellPadding: 6,
        lineColor: GRAY_300, lineWidth: 0.5, textColor: BLACK, valign: "top",
      },
      headStyles: { fillColor: GRAY_100, textColor: BLACK, fontStyle: "bold", fontSize: 8, halign: "center" },
      columnStyles: {
        0: { fillColor: GRAY_50, fontStyle: "bold", fontSize: 8, cellWidth: 90, textColor: GRAY_700 },
      },
      alternateRowStyles: { fillColor: false },
      rowPageBreak: "avoid",
    });
  }

  // Footer
  if (config.sourceUrl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastY: number = (doc as any).lastAutoTable?.finalY ?? y + 60;
    const footerY = lastY + 20;
    checkPage(20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_300);
    doc.text(
      `${config.sourceName ?? config.name} — CC BY 4.0`,
      pageW / 2,
      footerY,
      { align: "center" }
    );
  }

  // Derive a sensible filename from common party fields
  const party1 = (data["party1Company"] || data["provider_name"] || data["company_name"] || "Party1").trim();
  const party2 = (data["party2Company"] || data["customer_name"] || data["partner_name"] || "Party2").trim();
  const slug = config.name.replace(/\s+/g, "-");
  doc.save(`${slug}_${party1}_${party2}.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, ""));
}
