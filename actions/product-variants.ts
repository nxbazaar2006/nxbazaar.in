"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  bulkDeleteVariants,
  bulkUpdateVariants,
  buildVariantDrafts,
  deleteAttributeMaster,
  getProductVariantManagementData,
  persistGeneratedVariants,
  upsertAttributeMaster,
  upsertProductVariant,
} from "@/lib/services/product-variant-management";
import {
  attributeInputSchema,
  bulkVariantDeleteSchema,
  bulkVariantUpdateSchema,
  generateVariantsSchema,
  variantInputSchema,
  type AttributeInput,
  type BulkVariantDeleteInput,
  type BulkVariantUpdateInput,
  type GenerateVariantsInput,
  type VariantInput,
} from "@/lib/validations/product-variants";
import type { ActionResponse } from "@/types/api";

function revalidateVariantPaths(productId?: string) {
  revalidatePath("/dashboard/products");
  if (productId) {
    revalidatePath(`/dashboard/products/${productId}/variants`);
    revalidatePath(`/dashboard/(catalogue)/products/${productId}/variants`);
  }
}

function fieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Variant operation failed.";
}

export async function getProductVariantManager(productId: string) {
  try {
    const data = await getProductVariantManagementData(productId);
    if (!data) return { success: false, message: "Product not found." };
    return { success: true, message: "Variant manager loaded.", data };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function createAttribute(input: AttributeInput): Promise<ActionResponse<unknown>> {
  const parsed = attributeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted attribute fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    await upsertAttributeMaster(parsed.data);
    revalidateVariantPaths();
    return { success: true, message: "Attribute created.", data: null };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function updateAttribute(id: string, input: AttributeInput): Promise<ActionResponse<unknown>> {
  const parsed = attributeInputSchema.safeParse({ ...input, id });
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted attribute fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    await upsertAttributeMaster(parsed.data);
    revalidateVariantPaths();
    return { success: true, message: "Attribute updated.", data: null };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function deleteAttribute(id: string): Promise<ActionResponse<unknown>> {
  try {
    await deleteAttributeMaster(id);
    revalidateVariantPaths();
    return { success: true, message: "Attribute deactivated.", data: null };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function generateVariants(input: GenerateVariantsInput): Promise<ActionResponse<unknown>> {
  const parsed = generateVariantsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix variant generation settings.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    const manager = await getProductVariantManagementData(parsed.data.productId);
    if (!manager) return { success: false, message: "Product not found." };
    const drafts = buildVariantDrafts(parsed.data, manager.product.variants);

    if (parsed.data.persist && drafts.length > 0) {
      await persistGeneratedVariants(
        parsed.data,
        drafts.map((draft) => variantInputSchema.parse(draft)),
      );
      revalidateVariantPaths(parsed.data.productId);
    }

    return {
      success: true,
      message: parsed.data.persist
        ? `${drafts.length} variants generated.`
        : `${drafts.length} variant drafts generated.`,
      data: drafts,
    };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function updateVariant(input: VariantInput): Promise<ActionResponse<unknown>> {
  const parsed = variantInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted variant fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    await upsertProductVariant(parsed.data);
    revalidateVariantPaths(parsed.data.productId);
    return {
      success: true,
      message: parsed.data.id ? "Variant updated." : "Variant created.",
      data: null,
    };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function bulkUpdate(input: BulkVariantUpdateInput): Promise<ActionResponse<unknown>> {
  const parsed = bulkVariantUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Select variants and provide bulk update fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    const result = await bulkUpdateVariants(parsed.data);
    revalidateVariantPaths(parsed.data.productId);
    return { success: true, message: `${result.count} variants updated.`, data: result };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}

export async function bulkDelete(input: BulkVariantDeleteInput): Promise<ActionResponse<unknown>> {
  const parsed = bulkVariantDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Select variants to delete.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  try {
    const result = await bulkDeleteVariants(parsed.data);
    revalidateVariantPaths(parsed.data.productId);
    return {
      success: true,
      message: `${result.deleted} variants deleted, ${result.deactivated} variants deactivated.`,
      data: result,
    };
  } catch (error) {
    return { success: false, message: message(error) };
  }
}
