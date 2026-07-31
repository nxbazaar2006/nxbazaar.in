import { auth } from "@/auth";
import { Download, Plus } from "lucide-react";
import { getHsnCodes, type HsnCodeListParams } from "@/actions/hsn-code";
import HsnImportDialog from "@/components/back-office/hsn/HsnImportDialog";
import { HsnCodeDataTable } from "@/components/back-office/hsn/HsnCodeDataTable";
import PageHeader from "@/components/backoffice/PageHeader";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import type { HsnCodeWithCount, HsnTableRow } from "@/types/hsn";
export const dynamic = "force-dynamic";
export const revalidate = 0; const hsnStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
const hsnTaxTypes = ["TAXABLE", "NIL_RATED", "EXEMPT", "NON_GST"] as const;
const hsnSortKeys = ["code", "description", "chapter", "gstRate", "status", "updatedAt"] as const; function isOneOf<T extends readonly string[]>(values: T, value: string | undefined): value is T[number] {
    return Boolean(value && (values as readonly string[]).includes(value));
}
function toPlainHsnRow(row: HsnCodeWithCount): HsnTableRow {
    const toNumber = (value: unknown) => Number(value?.toString?.() ?? value ?? 0); const toIso = (value: unknown) => (value ? new Date(value as string | Date).toISOString() : null); return { id: row.id, code: row.code, description: row.description, chapter: row.chapter ?? null, gstRate: toNumber(row.gstRate), cgstRate: toNumber(row.cgstRate), sgstRate: toNumber(row.sgstRate), igstRate: toNumber(row.igstRate), cessRate: toNumber(row.cessRate), taxType: row.taxType, uqc: row.uqc ?? null, keywords: Array.isArray(row.keywords) ? row.keywords : [], status: row.status, effectiveTo: toIso(row.effectiveTo), createdById: row.createdById ?? null, updatedById: row.updatedById ?? null, createdAt: toIso(row.createdAt), updatedAt: toIso(row.updatedAt), _count: { categories: Number(row._count?.categories ?? 0), subCategories: Number(row._count?.subCategories ?? 0), products: Number(row._count?.products ?? 0), }, };
}
export default async function HsnCodesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
    const session = await auth(); const role = String(session?.user?.role ?? ""); const canDelete = role === "ADMIN" || role === "SUPER_ADMIN"; const params = await searchParams; const status = params.status?.toUpperCase(); const taxType = params.taxType?.toUpperCase(); const sortBy = params.sortBy; const sortOrder = params.sortOrder; const listParams: HsnCodeListParams = { page: Number(params.page ?? 1), pageSize: undefined, search: params.search, status: isOneOf(hsnStatuses, status) ? status : "all", gstRate: params.gstRate ? Number(params.gstRate) : undefined, chapter: params.chapter, taxType: isOneOf(hsnTaxTypes, taxType) ? taxType : "all", effectiveOn: params.effectiveOn, sortBy: isOneOf(hsnSortKeys, sortBy) ? sortBy : "updatedAt", sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc", };
    const result = await getHsnCodes(listParams); const data = result.success ? result.data : { rows: [], total: 0, page: 1, pageSize: 0, pageCount: 0 };
    const rows = data.rows; return (<div className="space-y-4 p-6"> {!result.success ? (<div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{result.message}</div>) : null} <HsnCodeDataTable rows={rows} canDelete={canDelete} headerSlot={<PageHeader heading="HSN Code" className="m-0 border-0 bg-transparent p-0 shadow-none backdrop-blur-0" actions={<> <HsnImportDialog /> <DashboardActionButton label="CSV Export" variant="primary" href="/api/hsn-codes/existing" icon={<Download className="h-4 w-4 text-white" />} /> <DashboardActionButton label="New HSN Code" variant="primary" href="/dashboard/hsn-codes/new" icon={<Plus className="h-4 w-4 text-white" />} /> </>} />} /> </div>);
}
