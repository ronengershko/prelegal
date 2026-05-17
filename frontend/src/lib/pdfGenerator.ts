import type { NDAFormData } from "./ndaGenerator";

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
