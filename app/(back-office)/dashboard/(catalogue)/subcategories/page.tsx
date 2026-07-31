import PageHeader from "@/components/shared/page-header";
import SubCategoryBulkDataTable from "@/components/backoffice/SubCategoryBulkDataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";
import { getHsnCodes } from "@/actions/hsn-code";

export default async function SubCategoriesPage() {
  const subCategoriesData = await getData("subcategories");
  const hsnCodesResult = await getHsnCodes({ status: "ACTIVE", sortBy: "code", sortOrder: "asc" });
  const subCategories = asArray(subCategoriesData);
  const hsnCodeOptions = hsnCodesResult.success
    ? hsnCodesResult.data.rows.map((hsn) => ({ id: hsn.id, code: hsn.code, description: hsn.description }))
    : [];

  const categoryOptions = Array.from(
    new Map(
      subCategories
        .filter((subCategory) => subCategory.category?.title)
        .map((subCategory) => [
          subCategory.category.title,
          { label: subCategory.category.title, value: subCategory.category.title },
        ]),
    ).values(),
  );

  const hsnOptions = Array.from(
    new Map(
      subCategories
        .filter((subCategory) => subCategory.hsnCode?.code)
        .map((subCategory) => [
          subCategory.hsnCode.code,
          { label: subCategory.hsnCode.code, value: subCategory.hsnCode.code },
        ]),
    ).values(),
  );

  return (
    <div>
      <PageHeader
        heading="Subcategories"
        actions={
          <DashboardActionButton
            label="Add Subcategory"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/subcategories/new"
          />
        }
      />
      <div className="py-8">
        <SubCategoryBulkDataTable
          subCategories={subCategories}
          hsnCodeOptions={hsnCodeOptions}
          categoryOptions={categoryOptions}
          hsnOptions={hsnOptions}
        />
      </div>
    </div>
  );
}
