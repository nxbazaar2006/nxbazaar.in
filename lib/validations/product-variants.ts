import { z } from "zod";

export const attributeValueInputSchema = z.object({
  id: z.string().optional(),
  value: z.string().trim().min(1, "Value is required."),
  slug: z.string().trim().optional(),
  colorCode: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  position: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const attributeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Attribute name is required."),
  slug: z.string().trim().optional(),
  inputType: z.enum(["SELECT", "MULTI_SELECT", "TEXT", "NUMBER", "BOOLEAN"]).default("SELECT"),
  isVariant: z.coerce.boolean().default(false),
  isFilterable: z.coerce.boolean().default(true),
  isRequired: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  position: z.coerce.number().int().min(0).default(0),
  values: z.array(attributeValueInputSchema).default([]),
});

export const productAttributeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  slug: z.string().trim().optional(),
  position: z.coerce.number().int().min(0).default(0),
  isVariant: z.coerce.boolean().default(true),
  values: z.array(attributeValueInputSchema).min(1, "Add at least one value."),
});

export const variantInventoryInputSchema = z.object({
  id: z.string().optional(),
  warehouseCode: z.string().trim().min(1, "Warehouse is required."),
  warehouseName: z.string().trim().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  reservedStock: z.coerce.number().int().min(0).default(0),
  incomingStock: z.coerce.number().int().min(0).default(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
});

export const variantImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().min(1, "Image URL is required."),
  altText: z.string().trim().optional().nullable(),
  position: z.coerce.number().int().min(0).default(0),
  isPrimary: z.coerce.boolean().default(false),
});

export const variantAttributeSelectionSchema = z.object({
  attribute: z.string().trim().min(1),
  attributeSlug: z.string().trim().optional(),
  value: z.string().trim().min(1),
  valueSlug: z.string().trim().optional(),
});

export const variantInputSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  title: z.string().trim().optional(),
  sku: z.string().trim().min(1, "SKU is required."),
  barcode: z.string().trim().min(1, "Barcode is required."),
  productCode: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  comparePrice: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  reservedStock: z.coerce.number().int().min(0).default(0),
  incomingStock: z.coerce.number().int().min(0).default(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().min(0).optional().nullable(),
  length: z.coerce.number().min(0).optional().nullable(),
  width: z.coerce.number().min(0).optional().nullable(),
  height: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  taxClass: z.enum(["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"]).default("TAXABLE"),
  hsnCodeId: z.string().optional().nullable(),
  gstRate: z.coerce.number().min(0).max(100).optional().nullable(),
  isDefault: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  values: z.array(variantAttributeSelectionSchema).default([]),
  inventory: z.array(variantInventoryInputSchema).default([]),
  images: z.array(variantImageInputSchema).default([]),
});

export const generateVariantsSchema = z.object({
  productId: z.string().min(1),
  vendorCode: z.string().trim().optional(),
  productCode: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0).default(0),
  baseComparePrice: z.coerce.number().min(0).optional().nullable(),
  baseCostPrice: z.coerce.number().min(0).optional().nullable(),
  defaultStock: z.coerce.number().int().min(0).default(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
  taxClass: z.enum(["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"]).default("TAXABLE"),
  hsnCodeId: z.string().optional().nullable(),
  gstRate: z.coerce.number().min(0).max(100).optional().nullable(),
  attributes: z.array(productAttributeInputSchema).min(1, "Add variant attributes."),
  persist: z.coerce.boolean().default(false),
});

export const bulkVariantUpdateSchema = z.object({
  productId: z.string().min(1),
  ids: z.array(z.string()).min(1, "Select at least one variant."),
  data: z.object({
    price: z.coerce.number().min(0).optional(),
    comparePrice: z.coerce.number().min(0).optional(),
    costPrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    reservedStock: z.coerce.number().int().min(0).optional(),
    incomingStock: z.coerce.number().int().min(0).optional(),
    lowStockAt: z.coerce.number().int().min(0).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    taxClass: z.enum(["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"]).optional(),
    hsnCodeId: z.string().optional().nullable(),
    gstRate: z.coerce.number().min(0).max(100).optional().nullable(),
    isActive: z.coerce.boolean().optional(),
  }),
});

export const bulkVariantDeleteSchema = z.object({
  productId: z.string().min(1),
  ids: z.array(z.string()).min(1, "Select at least one variant."),
});

export type AttributeInput = z.infer<typeof attributeInputSchema>;
export type ProductAttributeInput = z.infer<typeof productAttributeInputSchema>;
export type VariantInput = z.infer<typeof variantInputSchema>;
export type GenerateVariantsInput = z.infer<typeof generateVariantsSchema>;
export type BulkVariantUpdateInput = z.infer<typeof bulkVariantUpdateSchema>;
export type BulkVariantDeleteInput = z.infer<typeof bulkVariantDeleteSchema>;
