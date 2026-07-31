import { randomUUID } from "node:crypto";

/**
 * Standard Code 128 Symbol Patterns (Index 0 to 106)
 * Each pattern string specifies bar & space widths in module units (total width = 11 modules, except stop = 13 modules).
 */
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"                               // 100-106 (104=Start B, 106=Stop)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

/**
 * Encodes ASCII string into Code 128 Subset B symbol values and calculates checksum
 */
export function encodeCode128B(value: string): number[] {
  const symbols: number[] = [START_CODE_B];
  let checksumSum = START_CODE_B;

  for (let i = 0; i < value.length; i += 1) {
    const charCode = value.charCodeAt(i);
    // ASCII 32 (' ') to 126 ('~') maps to symbol value = charCode - 32
    let symbol = charCode - 32;
    if (symbol < 0 || symbol > 94) {
      symbol = 31; // fallback to '?' if outside ASCII printable range
    }
    symbols.push(symbol);
    checksumSum += symbol * (i + 1);
  }

  const checksum = checksumSum % 103;
  symbols.push(checksum);
  symbols.push(STOP_CODE);

  return symbols;
}

/**
 * Generates an SVG string representation of a Code 128 barcode
 */
export function generateCode128Svg({
  barcode,
  title,
  productCode,
  sku,
}: {
  barcode: string;
  title?: string | null;
  productCode?: string | null;
  sku?: string | null;
}): string {
  const cleanBarcode = String(barcode || "").trim().toUpperCase();
  const symbols = encodeCode128B(cleanBarcode);

  const moduleWidth = 2;
  const quietZone = 20;
  const barHeight = 65;

  let x = quietZone;
  let rectsSvg = "";

  for (const symbol of symbols) {
    const pattern = CODE128_PATTERNS[symbol] || CODE128_PATTERNS[0];
    for (let i = 0; i < pattern.length; i += 1) {
      const width = parseInt(pattern[i], 10) * moduleWidth;
      if (i % 2 === 0) {
        // Bar (black)
        rectsSvg += `<rect x="${x}" y="24" width="${width}" height="${barHeight}" fill="#0f172a" />`;
      }
      x += width;
    }
  }

  const totalWidth = Math.max(280, x + quietZone);

  const escapeXml = (str: string) =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] || c);

  const cleanTitle = title ? escapeXml(title) : "";
  const cleanSku = sku ? escapeXml(sku) : "";
  const cleanProdCode = productCode ? escapeXml(productCode) : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="140" viewBox="0 0 ${totalWidth} 140" style="background-color: #ffffff; font-family: Inter, Arial, sans-serif;">
  <rect width="100%" height="100%" fill="#ffffff" rx="8"/>
  ${cleanTitle ? `<text x="${totalWidth / 2}" y="16" text-anchor="middle" font-size="11" font-weight="600" fill="#0f172a">${cleanTitle}</text>` : ""}
  <g>${rectsSvg}</g>
  <text x="${totalWidth / 2}" y="106" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="2" fill="#0f172a">${escapeXml(cleanBarcode)}</text>
  ${cleanSku || cleanProdCode ? `<text x="${totalWidth / 2}" y="126" text-anchor="middle" font-size="10" fill="#64748b">SKU: ${cleanSku || "—"} | Code: ${cleanProdCode || "—"}</text>` : ""}
</svg>`;
}

/**
 * Generates an independent, sequential 12-digit Code 128 barcode number.
 * Format: BC100000000001, BC100000000002 ...
 */
export async function generateUniqueBarcode(prisma: any): Promise<string> {
  const START_SEQUENCE = 100000000001;

  // Find max existing sequential barcode
  const [lastVariant, lastProduct] = await Promise.all([
    prisma.productVariant.findFirst({
      where: { barcode: { startsWith: "BC" } },
      select: { barcode: true },
      orderBy: { barcode: "desc" },
    }),
    prisma.product.findFirst({
      where: { barcode: { startsWith: "BC" } },
      select: { barcode: true },
      orderBy: { barcode: "desc" },
    }),
  ]);

  const parseSeq = (code: string | null | undefined): number => {
    if (!code || !code.startsWith("BC")) return 0;
    const num = parseInt(code.slice(2), 10);
    return isNaN(num) ? 0 : num;
  };

  const maxSeq = Math.max(parseSeq(lastVariant?.barcode), parseSeq(lastProduct?.barcode), START_SEQUENCE - 1);
  let nextSeq = maxSeq + 1;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = `BC${nextSeq}`;

    const [existingVariant, existingProduct] = await Promise.all([
      prisma.productVariant.findFirst({ where: { barcode: candidate }, select: { id: true } }),
      prisma.product.findFirst({ where: { barcode: candidate }, select: { id: true } }),
    ]);

    if (!existingVariant && !existingProduct) {
      return candidate;
    }
    nextSeq += 1;
  }

  // Fallback with random UUID component if sequence loop runs out
  return `BC${Date.now()}${randomUUID().slice(0, 4).toUpperCase()}`;
}
