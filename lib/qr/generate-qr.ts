import type { QrOptions } from "@/types/qr";
import QRCode from "qrcode";

const DEFAULT_QR_OPTIONS: QrOptions = {
  errorCorrectionLevel: "M",
  margin: 4,
  width: 512,
  color: {
    dark: "#000000",
    light: "#ffffff",
  },
};

export async function generateQrDataUrl(text: string, options?: QrOptions): Promise<string> {
  const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    margin: mergedOptions.margin,
    width: mergedOptions.width,
    color: mergedOptions.color,
  });
}

export async function generateQrSvg(text: string, options?: QrOptions): Promise<string> {
  const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    margin: mergedOptions.margin,
    width: mergedOptions.width,
    color: mergedOptions.color,
  });
}

export async function generateQrPngBuffer(text: string, options?: QrOptions): Promise<Buffer> {
  const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
  return QRCode.toBuffer(text, {
    type: "png",
    errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    margin: mergedOptions.margin,
    width: mergedOptions.width,
    color: mergedOptions.color,
  });
}
