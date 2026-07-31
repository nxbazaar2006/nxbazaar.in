import { z } from "zod";

export const qrQuerySchema = z.object({
  productCode: z.string().trim().min(1, "Product code is required."),
  sku: z.string().trim().optional().nullable(),
  format: z.enum(["png", "svg"]).default("png"),
  size: z.coerce.number().int().min(64).max(2048).default(512),
});

export type QrQueryParams = z.infer<typeof qrQuerySchema>;
