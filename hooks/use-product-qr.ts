"use client";

import { buildProductQrUrl, buildVariantQrUrl } from "@/lib/qr/build-qr-url";
import { generateQrDataUrl, generateQrSvg } from "@/lib/qr/generate-qr";
import { useQuery, useMutation } from "@tanstack/react-query";

export type ProductQrQueryResult = {
  dataUrl: string;
  svgString: string;
  qrTargetUrl: string;
};

export function useProductQrData(
  productCode: string,
  sku?: string,
  size: number = 512
) {
  const qrTargetUrl = sku ? buildVariantQrUrl(productCode, sku) : buildProductQrUrl(productCode);

  return useQuery<ProductQrQueryResult, Error>({
    queryKey: ["product-qr", productCode, sku || "base", size],
    queryFn: async () => {
      if (!productCode) {
        throw new Error("Product code is required.");
      }

      const [dataUrl, svgString] = await Promise.all([
        generateQrDataUrl(qrTargetUrl, { width: size }),
        generateQrSvg(qrTargetUrl, { width: size }),
      ]);

      return {
        dataUrl,
        svgString,
        qrTargetUrl,
      };
    },
    staleTime: 1000 * 60 * 30, // Cache QR code data for 30 minutes
    gcTime: 1000 * 60 * 60,
    enabled: Boolean(productCode),
  });
}

export function useRecordQrScanMutation() {
  return useMutation({
    mutationFn: async (payload: {
      productCode: string;
      sku?: string;
      source?: string;
    }) => {
      const response = await fetch(`/api/products/${encodeURIComponent(payload.productCode)}/qr/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to record QR scan");
      }

      return response.json();
    },
  });
}
