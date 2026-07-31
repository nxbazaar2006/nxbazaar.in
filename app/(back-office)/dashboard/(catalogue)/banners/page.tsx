import PageHeader from "@/components/shared/page-header";
import DataTable from "@/components/data-table-components/DataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { columns } from "./columns";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";

export default async function page() {
  const bannersData = await getData("banners");
  const banners = asArray(bannersData);

  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Banners"
        actions={
          <DashboardActionButton
            label="Add Banner"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/banners/new"
          />
        }
      />
      <div className="py-8">
        <DataTable data={banners} columns={columns} />
      </div>
    </div>
  );
}