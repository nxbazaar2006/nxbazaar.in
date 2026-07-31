import PageHeader from "@/components/shared/page-header";
import DataTable from "@/components/data-table-components/DataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { columns } from "./columns";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";

export default async function page() {
  const farmersData = await getData("farmers");
  const farmers = asArray(farmersData);

  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Farmers"
        actions={
          <DashboardActionButton
            label="Add Farmer"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/farmers/new"
          />
        }
      />
      <div className="py-0">
        <DataTable data={farmers} columns={columns} filterKeys={["name"]} />
      </div>
    </div>
  );
}