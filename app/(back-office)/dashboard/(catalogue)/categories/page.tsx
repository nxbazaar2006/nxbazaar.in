import PageHeader from "@/components/shared/page-header";
import CategoryBulkDataTable from "@/components/backoffice/CategoryBulkDataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";
import { getHsnCodes } from "@/actions/hsn-code";

export default async function page() {
  const categoriesData = await getData("categories");
  const hsnCodesResult = await getHsnCodes({ status: "ACTIVE", sortBy: "code", sortOrder: "asc" });
  const categories = asArray(categoriesData);
  const hsnCodeOptions = hsnCodesResult.success
    ? hsnCodesResult.data.rows.map((hsn) => ({ id: hsn.id, code: hsn.code, description: hsn.description }))
    : [];

  const hsnOptions = Array.from(
    new Map(
      categories
        .filter((category) => category.hsnCode?.code)
        .map((category) => [
          category.hsnCode.code,
          {
            label: category.hsnCode.code,
            value: category.hsnCode.code,
          },
        ]),
    ).values(),
  );

  return (
    <div className="overflow-hidden rounded-bl-[20px] rounded-br-[20px] md:rounded-bl-[28px] md:rounded-br-[28px] xl:rounded-bl-[32px] xl:rounded-br-[32px]">
      {/* Header */}
      <PageHeader
        heading="Categories"
        actions={
          <DashboardActionButton
            label="Add Category"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/categories/new"
          />
        }
      />

      <div className="py-0">
        <CategoryBulkDataTable categories={categories} hsnCodeOptions={hsnCodeOptions} hsnOptions={hsnOptions} />
      </div>
    </div>
  );
}
