export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
}

export function downloadQrDataUrl(dataUrl: string, filename: string) {
  const cleanName = sanitizeFilename(filename);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = cleanName.endsWith(".png") ? cleanName : `${cleanName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadQrSvg(svgString: string, filename: string) {
  const cleanName = sanitizeFilename(filename);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanName.endsWith(".svg") ? cleanName : `${cleanName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
