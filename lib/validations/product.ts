import { z } from "zod";

export const productTaxRelationSchema = z.object({
  categoryId: z.string().uuid("Category is required"),
  subCategoryId: z.string().uuid("SubCategory is required"),
  hsnCodeId: z.string().uuid("HSN Code is required").optional().nullable().or(z.literal("")),
  hsnOverrideEnabled: z.coerce.boolean().optional(),
});

export type ProductTaxRelationValues = z.infer<typeof productTaxRelationSchema>;
