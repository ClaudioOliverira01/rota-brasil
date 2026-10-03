/**
 * Gerador de PDF mínimo, SEM dependências (não precisa de jsPDF).
 * Usa a fonte padrão Helvetica com codificação WinAnsi, que cobre
 * todos os acentos do português (á, ê, ç, ã, õ...).
 *
 * Uso:
 *   const pdf = new SimplePdf();
 *   pdf.text("Olá", 50, 50, { size: 20, bold: true });  // y = distância do topo
 *   pdf.addPage();
 *   const blob = pdf.toBlob();
 */
const PAGE_W = 595; // A4 em pontos
const PAGE_H = 842;

function toWinAnsi(str) {
  const map = { "•": 0x95, "–": 0x96, "—": 0x97, "“": 0x93, "”": 0x94, "‘": 0x91, "’": 0x92, "…": 0x85, "€": 0x80 };
  const bytes = [];
  for (const ch of String(str ?? "")) {
    const code = ch.codePointAt(0);
    if (map[ch] !== undefined) bytes.push(map[ch]);
    else if (code >= 32 && code <= 126) bytes.push(code);
    else if (code >= 160 && code <= 255) bytes.push(code);
    else bytes.push(63); // "?" para emojis e símbolos fora da fonte
  }
  return bytes;
}

function escapeBytes(bytes) {
  let out = "";
  for (const b of bytes) {
    if (b === 40 || b === 41 || b === 92) out += "\\" + String.fromCharCode(b);
    else if (b < 32 || b > 126) out += "\\" + b.toString(8).padStart(3, "0");
    else out += String.fromCharCode(b);
  }
  return out;
}

export class SimplePdf {
  constructor() {
    this.pages = [[]];
  }

  get width() { return PAGE_W; }
  get height() { return PAGE_H; }

  addPage() { this.pages.push([]); }

  /** Texto. y é medido a partir do TOPO da página. */
  text(str, x, y, { size = 12, bold = false, color = [0, 0, 0] } = {}) {
    const [r, g, b] = color.map(c => (c / 255).toFixed(3));
    this.pages[this.pages.length - 1].push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf ${r} ${g} ${b} rg ${x.toFixed(2)} ${(PAGE_H - y).toFixed(2)} Td (${escapeBytes(toWinAnsi(str))}) Tj ET`
    );
  }

  /** Retângulo preenchido. y = topo do retângulo. */
  rect(x, y, w, h, color = [0, 0, 0]) {
    const [r, g, b] = color.map(c => (c / 255).toFixed(3));
    this.pages[this.pages.length - 1].push(
      `${r} ${g} ${b} rg ${x.toFixed(2)} ${(PAGE_H - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  }

  build() {
    const objs = []; // cada item: string do objeto (sem "n 0 obj")
    const n = this.pages.length;
    // 1 Catalog, 2 Pages, 3 F1, 4 F2, depois (page, content) por página
    const pageIds = [];
    objs[1] = "";
    objs[2] = "";
    objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    let id = 5;
    this.pages.forEach(ops => {
      const pageId = id++;
      const contentId = id++;
      pageIds.push(pageId);
      const stream = ops.join("\n");
      objs[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
      objs[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });
    objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objs[2] = `<< /Type /Pages /Kids [${pageIds.map(p => `${p} 0 R`).join(" ")}] /Count ${n} >>`;

    let out = "%PDF-1.4\n";
    const offsets = [];
    for (let i = 1; i < objs.length; i++) {
      offsets[i] = out.length;
      out += `${i} 0 obj\n${objs[i]}\nendobj\n`;
    }
    const xref = out.length;
    out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objs.length; i++) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

    // string -> bytes (todos os caracteres já são ASCII; o conteúdo usa octais)
    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }

  toBlob() {
    return new Blob([this.build()], { type: "application/pdf" });
  }
}