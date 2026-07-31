"use server";

import { HsnStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/lib/db";
import {
  createHsnCodeSchema,
  hsnAssignmentSchema,
  updateHsnCodeSchema,
  type HsnCodeFormInput,
  type HsnCodeFormValues,
} from "@/lib/validations/hsn-code";
import { requireHsnPermission } from "@/lib/hsn/permissions";
import { decimalToNumber, hasRateChanged, toDecimal } from "@/lib/hsn/validation";
import type {
  HsnCodeDetailRecord,
  HsnCodeRecord,
  HsnCodeRow,
  HsnCodeWithCount,
  HsnDetailRow,
  HsnRateHistoryRecord,
  HsnRateHistoryRow,
  HsnTableRow,
} from "@/types/hsn";
import type { ActionResponse } from "@/types/api";

export type HsnCodeListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "all" | HsnStatus;
  gstRate?: number;
  chapter?: string;
  taxType?: "all" | "TAXABLE" | "NIL_RATED" | "EXEMPT" | "NON_GST";
  effectiveOn?: string;
  sortBy?: "code" | "description" | "chapter" | "gstRate" | "status" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type HsnCodeListItem = HsnTableRow;

export type HsnCodeListResult = {
  rows: HsnCodeListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type BulkImportMode = "CREATE_ONLY" | "UPSERT" | "SKIP_EXISTING";
export type BulkImportHsnInput = {
  mode?: BulkImportMode;
  dryRun?: boolean;
  rows: Array<Record<string, unknown> & { rowNumber?: number }>;
};

const hsnRevalidatePaths = [
  "/dashboard/hsn-codes",
  "/dashboard/categories",
  "/dashboard/subcategories",
  "/dashboard/sub-categories",
  "/dashboard/products",
];

const hsnIdSchema = z.string().uuid();
const bulkDeleteHsnSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

type HsnDeleteRelationCounts = {
  categories: number;
  subCategories: number;
  products: number;
  rateHistory: number;
};

export type BulkDeleteHsnResult = {
  requested: number;
  deleted: number;
  skipped: number;
  skippedRecords: Array<{
    id: string;
    code: string;
    reason: string;
  }>;
};

function revalidateHsnPaths() {
  hsnRevalidatePaths.forEach((path) => revalidatePath(path));
}

function prismaMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "HSN code already exists.";
    if (error.code === "P2025") return "Record not found.";
    return `Database error ${error.code}.`;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

async function requireHsnDeletePermission() {
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return auth;
  const role = String(auth.user.role);
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { ok: false as const, message: "You are not authorized to delete HSN codes." };
  }
  return auth;
}

function hasAssignments(counts: HsnDeleteRelationCounts) {
  return counts.categories > 0 || counts.subCategories > 0 || counts.products > 0 || counts.rateHistory > 0;
}

function assignedReason(counts: HsnDeleteRelationCounts) {
  const parts = [
    counts.categories ? `${counts.categories} ${counts.categories === 1 ? "category" : "categories"}` : null,
    counts.subCategories ? `${counts.subCategories} ${counts.subCategories === 1 ? "subcategory" : "subcategories"}` : null,
    counts.products ? `${counts.products} ${counts.products === 1 ? "product" : "products"}` : null,
    counts.rateHistory ? `${counts.rateHistory} rate history ${counts.rateHistory === 1 ? "record" : "records"}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join(", ").replace(/, ([^,]*)$/, " and $1");
}

function dateToIso(value: unknown) {
  return value ? new Date(value as string | Date).toISOString() : null;
}

function normalizeHsn(row: HsnCodeDetailRecord): HsnDetailRow;
function normalizeHsn(row: HsnCodeWithCount): HsnTableRow;
function normalizeHsn(row: HsnRateHistoryRecord): HsnRateHistoryRow;
function normalizeHsn(row: HsnCodeRecord): HsnCodeRow;
function normalizeHsn(row: HsnCodeRecord | HsnCodeWithCount | HsnCodeDetailRecord | HsnRateHistoryRecord): HsnCodeRow | HsnTableRow | HsnDetailRow | HsnRateHistoryRow {
  const base = {
    ...row,
    gstRate: decimalToNumber(row.gstRate),
    cgstRate: decimalToNumber(row.cgstRate),
    sgstRate: decimalToNumber(row.sgstRate),
    igstRate: decimalToNumber(row.igstRate),
    cessRate: decimalToNumber(row.cessRate),
    ...("effectiveFrom" in row ? { effectiveFrom: dateToIso(row.effectiveFrom) } : {}),
    effectiveTo: dateToIso(row.effectiveTo),
    createdAt: dateToIso(row.createdAt),
    ...("updatedAt" in row ? { updatedAt: dateToIso(row.updatedAt) } : {}),
  };

  if ("rateHistory" in row) {
    const rateHistory = row.rateHistory.map((item) => normalizeHsn(item as HsnRateHistoryRecord));
    return Object.assign(base, { rateHistory }) as HsnDetailRow;
  }
  if ("_count" in row) return base as HsnTableRow;
  if ("hsnCodeId" in row) return base as HsnRateHistoryRow;
  return base as HsnCodeRow;
}

function toHsnData(input: HsnCodeFormValues, userId?: string) {
  return {
    code: input.code.trim(),
    description: input.description.trim(),
    chapter: input.chapter || null,
    gstRate: toDecimal(input.gstRate),
    cgstRate: toDecimal(input.cgstRate ?? Number((input.gstRate / 2).toFixed(2))),
    sgstRate: toDecimal(input.sgstRate ?? Number((input.gstRate / 2).toFixed(2))),
    igstRate: toDecimal(input.igstRate),
    cessRate: toDecimal(input.cessRate ?? 0),
    taxType: input.taxType,
    uqc: input.uqc || null,
    keywords: input.keywords,
    status: input.status,
    effectiveTo: input.effectiveTo ?? null,
    updatedById: userId,
  };
}

async function audit({
  action,
  entityId,
  oldValue,
  newValue,
  user,
  metadata,
}: {
  action: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  user?: { id?: string; role?: string };
  metadata?: Prisma.InputJsonValue;
}) {
  await db.auditLog
    .create({
      data: {
        actorId: user?.id,
        action,
        entityType: "HsnCode",
        entityId,
        oldValue: oldValue ? (oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValue: newValue ? (newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        metadata: metadata ?? Prisma.JsonNull,
      },
    })
    .catch(() => null);
}

async function ensureActiveHsn(hsnCodeId?: string | null) {
  if (!hsnCodeId) return null;
  const hsnCode = await db.hsnCode.findFirst({
    where: {
      id: hsnCodeId,
      status: "ACTIVE",
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
    },
    select: { id: true },
  });
  if (!hsnCode) throw new Error("Only active, non-expired HSN codes can be assigned.");
  return hsnCode.id;
}

export async function createHsnCode(input: HsnCodeFormInput): Promise<ActionResponse<HsnCodeRow>> {
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return { success: false, message: auth.message };

  const parsed = createHsnCodeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const duplicate = await db.hsnCode.findUnique({ where: { code: parsed.data.code }, select: { code: true } });
    if (duplicate) {
      return { success: false, message: `HSN code ${parsed.data.code} already exists.` };
    }
    const created = await db.hsnCode.create({
      data: { ...toHsnData(parsed.data, auth.user.id), createdById: auth.user.id },
    });
    await audit({ action: "CREATE", entityId: created.id, newValue: normalizeHsn(created), user: auth.user });
    revalidateHsnPaths();
    return { success: true, message: "HSN code created successfully.", data: normalizeHsn(created) };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function updateHsnCode(id: string, input: HsnCodeFormInput): Promise<ActionResponse<HsnCodeRow>> {
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return { success: false, message: auth.message };

  const parsed = updateHsnCodeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await db.$transaction(async (prisma) => {
      const current = await prisma.hsnCode.findUnique({ where: { id } });
      if (!current) throw new Error("HSN code not found.");
      const data = toHsnData(parsed.data, auth.user.id);
      if (hasRateChanged(current, parsed.data)) {
        const effectiveFrom = new Date();
        await prisma.hsnRateHistory.updateMany({
          where: { hsnCodeId: id, effectiveTo: null },
          data: { effectiveTo: effectiveFrom },
        });
        await prisma.hsnRateHistory.create({
          data: {
            hsnCodeId: id,
            gstRate: current.gstRate,
            cgstRate: current.cgstRate,
            sgstRate: current.sgstRate,
            igstRate: current.igstRate,
            cessRate: current.cessRate,
            effectiveFrom: current.createdAt,
            effectiveTo: effectiveFrom,
            changeReason: parsed.data.changeReason || null,
            createdById: auth.user.id,
          },
        });
      }
      const updated = await prisma.hsnCode.update({ where: { id }, data });
      await audit({
        action: hasRateChanged(current, parsed.data) ? "RATE_CHANGE" : "UPDATE",
        entityId: id,
        oldValue: normalizeHsn(current),
        newValue: normalizeHsn(updated),
        user: auth.user,
      });
      return updated;
    });
    revalidateHsnPaths();
    return { success: true, message: "HSN code updated successfully.", data: normalizeHsn(result) };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function getHsnCodes(params: HsnCodeListParams = {}): Promise<ActionResponse<HsnCodeListResult>> {
  const auth = await requireHsnPermission("SEARCH");
  if (!auth.ok) return { success: false, message: auth.message };

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ? Math.max(1, params.pageSize) : undefined;
  const search = params.search?.trim();
  const effectiveOn = params.effectiveOn ? new Date(params.effectiveOn) : null;
  const where: Prisma.HsnCodeWhereInput = {
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { chapter: { contains: search, mode: "insensitive" } },
            { keywords: { has: search } },
          ],
        }
      : {}),
    ...(auth.user.role === "SELLER" ? { status: "ACTIVE" } : {}),
    ...(params.status && params.status !== "all" ? { status: params.status } : {}),
    ...(params.gstRate !== undefined ? { gstRate: toDecimal(params.gstRate) } : {}),
    ...(params.chapter ? { chapter: params.chapter } : {}),
    ...(params.taxType && params.taxType !== "all" ? { taxType: params.taxType } : {}),
    ...(effectiveOn
      ? {
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveOn } }],
        }
      : {}),
  };

  const sortBy = params.sortBy ?? "updatedAt";
  const sortOrder = params.sortOrder ?? "desc";

  try {
    const [rows, total] = await Promise.all([
      db.hsnCode.findMany({
        where,
        ...(pageSize ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { categories: true, subCategories: true, products: true } } },
      }),
      db.hsnCode.count({ where }),
    ]);

    return {
      success: true,
      message: "HSN codes fetched successfully.",
      data: {
        rows: rows.map((row) => normalizeHsn(row as HsnCodeWithCount)),
        total,
        page,
        pageSize: pageSize ?? rows.length,
        pageCount: pageSize ? Math.ceil(total / pageSize) : 1,
      },
    };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function getHsnCodeById(id: string): Promise<ActionResponse<HsnDetailRow>> {
  const auth = await requireHsnPermission("SEARCH");
  if (!auth.ok) return { success: false, message: auth.message };
  const hsnCode = await db.hsnCode.findUnique({
    where: { id },
    include: {
      categories: { select: { id: true, title: true, slug: true } },
      subCategories: { select: { id: true, title: true, slug: true } },
      products: { select: { id: true, title: true, slug: true } },
      rateHistory: { orderBy: { effectiveFrom: "desc" } },
    },
  });
  if (!hsnCode || (auth.user.role === "SELLER" && hsnCode.status !== "ACTIVE")) {
    return { success: false, message: "HSN code not found." };
  }
  return { success: true, message: "HSN code fetched successfully.", data: normalizeHsn(hsnCode as HsnCodeDetailRecord) };
}

export async function searchHsnCodes(search: string): Promise<ActionResponse<HsnCodeListItem[]>> {
  const normalizedSearch = search.trim();
  if (normalizedSearch.length === 1) {
    return { success: true, message: "Enter at least 2 characters.", data: [] };
  }
  const result = await getHsnCodes({
    search: normalizedSearch || undefined,
    status: "ACTIVE",
    effectiveOn: new Date().toISOString(),
    page: 1,
    pageSize: 20,
    sortBy: "code",
    sortOrder: "asc",
  });
  if (!result.success) {
    return { success: false, message: result.message, fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined };
  }
  return { success: true, message: "HSN search completed.", data: result.data.rows };
}

export async function changeHsnStatus(id: string, status: HsnStatus): Promise<ActionResponse<HsnCodeRow>> {
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return { success: false, message: auth.message };
  try {
    const current = await db.hsnCode.findUnique({ where: { id } });
    if (!current) return { success: false, message: "HSN code not found." };
    const updated = await db.hsnCode.update({ where: { id }, data: { status, updatedById: auth.user.id } });
    await audit({ action: "STATUS_CHANGE", entityId: id, oldValue: { status: current.status }, newValue: { status }, user: auth.user });
    revalidateHsnPaths();
    return { success: true, message: `HSN code ${status.toLowerCase()} successfully.`, data: normalizeHsn(updated) };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function toggleHsnCodeStatus(id: string) {
  const hsn = await db.hsnCode.findUnique({ where: { id }, select: { status: true } });
  return changeHsnStatus(id, hsn?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
}

export async function deleteHsnCode(id: string): Promise<ActionResponse<null>> {
  const auth = await requireHsnDeletePermission();
  if (!auth.ok) return { success: false, message: auth.message };
  const parsed = hsnIdSchema.safeParse(id);
  if (!parsed.success) return { success: false, message: "Invalid HSN code id." };
  try {
    const hsnCode = await db.hsnCode.findUnique({
      where: { id: parsed.data },
      select: {
        id: true,
        code: true,
        _count: {
          select: {
            categories: true,
            subCategories: true,
            products: true,
            rateHistory: true,
          },
        },
      },
    });
    if (!hsnCode) return { success: false, message: "HSN code not found." };
    if (hasAssignments(hsnCode._count)) {
      return {
        success: false,
        message: `HSN code ${hsnCode.code} cannot be deleted because it is assigned to ${assignedReason(hsnCode._count)}.`,
      };
    }
    await db.hsnCode.delete({ where: { id: parsed.data } });
    await audit({ action: "DELETE", entityId: parsed.data, oldValue: { id: hsnCode.id, code: hsnCode.code }, user: auth.user });
    revalidateHsnPaths();
    return { success: true, message: `HSN code ${hsnCode.code} deleted successfully.`, data: null };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function deleteHsnCodes(ids: string[]): Promise<ActionResponse<BulkDeleteHsnResult>> {
  const auth = await requireHsnDeletePermission();
  if (!auth.ok) return { success: false, message: auth.message };

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const parsed = bulkDeleteHsnSchema.safeParse({ ids: uniqueIds });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues.map((issue) => issue.message).join("; ") };
  }

  try {
    const result = await db.$transaction(async (prisma) => {
      const records = await prisma.hsnCode.findMany({
        where: { id: { in: parsed.data.ids } },
        select: {
          id: true,
          code: true,
          _count: {
            select: {
              categories: true,
              subCategories: true,
              products: true,
              rateHistory: true,
            },
          },
        },
      });
      const foundIds = new Set(records.map((record) => record.id));
      const missingRecords = parsed.data.ids
        .filter((requestedId) => !foundIds.has(requestedId))
        .map((requestedId) => ({
          id: requestedId,
          code: "-",
          reason: "HSN code not found",
        }));
      const skippedAssigned = records
        .filter((record) => hasAssignments(record._count))
        .map((record) => ({
          id: record.id,
          code: record.code,
          reason: "Assigned to categories, subcategories, products or rate history",
        }));
      const deletableIds = records.filter((record) => !hasAssignments(record._count)).map((record) => record.id);

      let deleted = 0;
      if (deletableIds.length > 0) {
        const deleteResult = await prisma.hsnCode.deleteMany({ where: { id: { in: deletableIds } } });
        deleted = deleteResult.count;
      }

      return {
        requested: parsed.data.ids.length,
        deleted,
        skipped: skippedAssigned.length + missingRecords.length,
        skippedRecords: [...skippedAssigned, ...missingRecords],
      };
    });

    await audit({ action: "BULK_DELETE", newValue: result, user: auth.user });
    revalidateHsnPaths();
    const message =
      result.skipped > 0
        ? `${result.deleted} HSN codes deleted. ${result.skipped} records skipped because they are in use.`
        : `${result.deleted} HSN codes deleted.`;
    return { success: true, message, data: result };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function getHsnRateHistory(id: string): Promise<ActionResponse<HsnRateHistoryRow[]>> {
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return { success: false, message: auth.message };
  const history = await db.hsnRateHistory.findMany({
    where: { hsnCodeId: id },
    orderBy: { effectiveFrom: "desc" },
  });
  return { success: true, message: "HSN rate history fetched.", data: history.map((item) => normalizeHsn(item as HsnRateHistoryRecord)) };
}

export async function assignHsnToCategory(input: { entityId: string; hsnCodeId?: string | null }) {
  const auth = await requireHsnPermission("ASSIGN");
  if (!auth.ok) return { success: false, message: auth.message };
  const parsed = hsnAssignmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Invalid assignment.", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const hsnCodeId = await ensureActiveHsn(parsed.data.hsnCodeId);
    const updated = await db.category.update({ where: { id: parsed.data.entityId }, data: { hsnCodeId } });
    await audit({ action: "CATEGORY_ASSIGNMENT", entityId: hsnCodeId ?? undefined, newValue: parsed.data, user: auth.user });
    revalidateHsnPaths();
    return { success: true, message: "HSN assigned to category.", data: updated };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function assignHsnToSubCategory(input: { entityId: string; hsnCodeId?: string | null }) {
  const auth = await requireHsnPermission("ASSIGN");
  if (!auth.ok) return { success: false, message: auth.message };
  const parsed = hsnAssignmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Invalid assignment.", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const hsnCodeId = await ensureActiveHsn(parsed.data.hsnCodeId);
    const updated = await db.subCategory.update({ where: { id: parsed.data.entityId }, data: { hsnCodeId } });
    await audit({ action: "SUBCATEGORY_ASSIGNMENT", entityId: hsnCodeId ?? undefined, newValue: parsed.data, user: auth.user });
    revalidateHsnPaths();
    return { success: true, message: "HSN assigned to subcategory.", data: updated };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function assignHsnToProduct(input: { entityId: string; hsnCodeId?: string | null; hsnOverrideEnabled?: boolean }) {
  const auth = await requireHsnPermission("PRODUCT_OVERRIDE");
  if (!auth.ok) return { success: false, message: auth.message };
  const parsed = hsnAssignmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Invalid assignment.", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const hsnCodeId = parsed.data.hsnOverrideEnabled ? await ensureActiveHsn(parsed.data.hsnCodeId) : null;
    const updated = await db.product.update({
      where: { id: parsed.data.entityId },
      data: { hsnCodeId, hsnOverrideEnabled: Boolean(parsed.data.hsnOverrideEnabled) },
    });
    await audit({ action: "PRODUCT_ASSIGNMENT", entityId: hsnCodeId ?? undefined, newValue: parsed.data, user: auth.user });
    revalidateHsnPaths();
    return { success: true, message: "HSN assigned to product.", data: updated };
  } catch (error) {
    return { success: false, message: prismaMessage(error) };
  }
}

export async function removeHsnAssignment(entityType: "CATEGORY" | "SUBCATEGORY" | "PRODUCT", entityId: string) {
  if (entityType === "CATEGORY") return assignHsnToCategory({ entityId, hsnCodeId: null });
  if (entityType === "SUBCATEGORY") return assignHsnToSubCategory({ entityId, hsnCodeId: null });
  return assignHsnToProduct({ entityId, hsnCodeId: null, hsnOverrideEnabled: false });
}

export async function bulkActivateHsnCodes(ids: string[]) {
  return bulkUpdateHsnCodeStatus(ids, "ACTIVE");
}

export async function bulkDeactivateHsnCodes(ids: string[]) {
  return bulkUpdateHsnCodeStatus(ids, "INACTIVE");
}

export async function bulkUpdateHsnCodeStatus(ids: string[], status: HsnStatus | boolean) {
  const nextStatus: HsnStatus = typeof status === "boolean" ? (status ? "ACTIVE" : "INACTIVE") : status;
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return { success: false, message: auth.message };
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const result = await db.hsnCode.updateMany({ where: { id: { in: uniqueIds } }, data: { status: nextStatus, updatedById: auth.user.id } });
  await audit({ action: "STATUS_CHANGE", newValue: { ids: uniqueIds, status: nextStatus }, user: auth.user });
  revalidateHsnPaths();
  return { success: true, message: `${result.count} HSN codes updated.`, data: { requested: uniqueIds.length, updated: result.count } };
}

export async function bulkDeleteHsnCodes(ids: string[]) {
  return deleteHsnCodes(ids);
}

export type BulkImportHsnResult = {
  totalRows: number;
  validRows: number;
  created: number;
  updated: number;
  skipped: number;
  duplicates: number;
  failed: number;
  errors: Array<{ rowNumber: number; code?: string; message: string }>;
};

export async function bulkImportHsnCodes(input: BulkImportHsnInput): Promise<ActionResponse<BulkImportHsnResult>> {
  const auth = await requireHsnPermission("MANAGE");
  if (!auth.ok) return { success: false, message: auth.message };
  if (!Array.isArray(input.rows) || input.rows.length === 0) {
    return { success: false, message: "Please upload a CSV or Excel file with at least one HSN row." };
  }
  const mode = input.mode ?? "CREATE_ONLY";
  const errors: Array<{ rowNumber: number; code?: string; message: string }> = [];
  const skippedIssues: Array<{ rowNumber: number; code?: string; message: string }> = [];
  const validRows: Array<HsnCodeFormValues & { rowNumber: number }> = [];
  const seen = new Set<string>();

  input.rows.forEach((row, index) => {
    const parsed = createHsnCodeSchema.safeParse({
      ...row,
      keywords: row.keywords,
      cessRate: row.cessRate ?? 0,
      status: row.status ?? "ACTIVE",
    });
    const rowNumber = Number(row.rowNumber ?? index + 2);
    const code = String(row.code ?? "");
    if (!parsed.success) {
      errors.push({ rowNumber, code, message: parsed.error.issues.map((issue) => issue.message).join("; ") });
      return;
    }
    if (seen.has(parsed.data.code)) {
      skippedIssues.push({ rowNumber, code: parsed.data.code, message: "Duplicate HSN code in file. This row was skipped." });
      return;
    }
    seen.add(parsed.data.code);
    validRows.push({ ...parsed.data, rowNumber });
  });

  const existingCodes = new Set(
    (
      await db.hsnCode.findMany({
        where: { code: { in: validRows.map((row) => row.code) } },
        select: { code: true },
      })
    ).map((row) => row.code)
  );
  const existingDuplicateRows =
    mode === "UPSERT"
      ? []
      : validRows
          .filter((row) => existingCodes.has(row.code))
          .map((row) => ({
            rowNumber: row.rowNumber,
            code: row.code,
            message: "HSN code already exists in database. This row was skipped.",
          }));

  if (input.dryRun) {
    const duplicateCount = skippedIssues.length + existingDuplicateRows.length;
    const skipped = duplicateCount;
    return {
      success: true,
      message: `Dry run completed. ${validRows.length - existingDuplicateRows.length} rows can be imported. ${skipped} duplicate rows will be skipped.`,
      data: {
        totalRows: input.rows.length,
        validRows: validRows.length,
        created: mode === "UPSERT" ? validRows.filter((row) => !existingCodes.has(row.code)).length : validRows.length - existingDuplicateRows.length,
        updated: mode === "UPSERT" ? validRows.filter((row) => existingCodes.has(row.code)).length : 0,
        skipped,
        duplicates: duplicateCount,
        failed: errors.length,
        errors: [...errors, ...skippedIssues, ...existingDuplicateRows],
      },
    };
  }

  let created = 0;
  let updated = 0;
  let skipped = skippedIssues.length;
  let duplicates = skippedIssues.length;
  for (const row of validRows) {
    try {
      const exists = existingCodes.has(row.code);
      if (exists && mode !== "UPSERT") {
        skipped += 1;
        duplicates += 1;
        skippedIssues.push({
          rowNumber: row.rowNumber,
          code: row.code,
          message: mode === "SKIP_EXISTING" ? "HSN code already exists in database. This row was skipped." : "HSN code already exists in database. Duplicate was not created.",
        });
        continue;
      }
      if (exists) {
        await db.hsnCode.update({ where: { code: row.code }, data: toHsnData(row, auth.user.id) });
        updated += 1;
      } else {
        await db.hsnCode.create({ data: { ...toHsnData(row, auth.user.id), createdById: auth.user.id } });
        created += 1;
      }
    } catch (error) {
      errors.push({ rowNumber: row.rowNumber, code: row.code, message: prismaMessage(error) });
    }
  }
  await audit({ action: "IMPORT", newValue: { created, updated, skipped, duplicates, failed: errors.length }, user: auth.user });
  revalidateHsnPaths();
  const message = `HSN import completed. Total: ${input.rows.length}, added: ${created}, updated: ${updated}, skipped duplicates: ${duplicates}, failed: ${errors.length}.`;
  return {
    success: true,
    message,
    data: {
      totalRows: input.rows.length,
      validRows: validRows.length,
      created,
      updated,
      skipped,
      duplicates,
      failed: errors.length,
      errors: [...errors, ...skippedIssues],
    },
  };
}
