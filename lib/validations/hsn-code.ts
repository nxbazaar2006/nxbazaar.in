import { z } from "zod";

export const allowedHsnCodeLengths = [4, 6, 8] as const;
export const ALLOWED_GST_RATES = [0, 3, 5, 12, 18, 28] as const;
export const defaultAllowedGstRates = ALLOWED_GST_RATES;
export const hsnStatusValues = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export const hsnTaxTypeValues = ["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"] as const;

export const configuredAllowedGstRates = [...ALLOWED_GST_RATES];

export function parseRate(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;

  const normalized = String(value).trim().replace("%", "").replace(",", ".");
  const rate = Number(normalized);

  if (!Number.isFinite(rate)) {
    throw new Error(`Invalid tax rate: ${String(value)}`);
  }

  return rate;
}

export function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}

const rateSchema = z
  .unknown()
  .transform((value, context) => {
    try {
      return parseRate(value);
    } catch (error) {
      context.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid tax rate.",
      });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .number({ error: "Rate is required." })
      .min(0, "Negative tax rates are not allowed.")
      .max(100, "Rate cannot exceed 100.")
  );

function asDate(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  return value instanceof Date ? value : new Date(String(value));
}

export const hsnCodeSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d+$/, "HSN code must be numeric.")
      .refine(
        (value) => allowedHsnCodeLengths.includes(value.length as 4 | 6 | 8),
        "HSN code must be 4, 6, or 8 digits."
      ),
    description: z.string().trim().min(1, "Official description is required."),
    chapter: z.string().trim().optional().or(z.literal("")),
    gstRate: rateSchema.refine(
      (value) => (configuredAllowedGstRates as number[]).includes(Number(value)),
      `GST rate must be one of ${configuredAllowedGstRates.join(", ")}.`
    ),
    cgstRate: rateSchema.optional(),
    sgstRate: rateSchema.optional(),
    igstRate: rateSchema,
    cessRate: rateSchema.default(0),
    taxType: z.enum(hsnTaxTypeValues, { error: "Tax type is required." }).default("TAXABLE"),
    uqc: z.string().trim().optional().or(z.literal("")),
    keywords: z
      .union([z.array(z.string()), z.string()])
      .default([])
      .transform((value) =>
        Array.isArray(value)
          ? value.map((item) => item.trim()).filter(Boolean)
          : value.split(",").map((item) => item.trim()).filter(Boolean)
      ),
    status: z.enum(hsnStatusValues, { error: "Status is required." }).default("ACTIVE"),
    effectiveTo: z.preprocess(asDate, z.date().optional()),
    changeReason: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((value, context) => {
    const cgstRate = value.cgstRate ?? Number((value.gstRate / 2).toFixed(2));
    const sgstRate = value.sgstRate ?? Number((value.gstRate / 2).toFixed(2));
    if (!nearlyEqual(cgstRate + sgstRate, value.gstRate)) {
      context.addIssue({
        code: "custom",
        path: ["cgstRate"],
        message: "CGST + SGST must equal GST rate.",
      });
    }
    if (!nearlyEqual(value.igstRate, value.gstRate)) {
      context.addIssue({
        code: "custom",
        path: ["igstRate"],
        message: "IGST must equal GST rate.",
      });
    }
  });

export const createHsnCodeSchema = hsnCodeSchema;
export const updateHsnCodeSchema = hsnCodeSchema;

export const hsnAssignmentSchema = z.object({
  entityId: z.string().uuid(),
  hsnCodeId: z.string().uuid().nullable().optional(),
  hsnOverrideEnabled: z.coerce.boolean().optional(),
});

export type HsnCodeFormValues = z.infer<typeof hsnCodeSchema>;
export type HsnCodeFormInput = z.input<typeof hsnCodeSchema>;
