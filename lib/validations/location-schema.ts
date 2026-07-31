import { INDIAN_PIN_CODE_REGEX } from "@/lib/india/pin-code";
import { z } from "zod";

export const locationSchema = z.object({
  country: z.literal("India"),
  countryCode: z.literal("IN"),
  state: z.string().trim().min(1, "State is required."),
  stateCode: z.string(),
  city: z.string().trim().min(1, "City is required."),
  pinCode: z
    .string()
    .trim()
    .regex(INDIAN_PIN_CODE_REGEX, "Enter a valid 6-digit Indian PIN code (e.g. 400001)."),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
