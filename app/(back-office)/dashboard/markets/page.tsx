import PageHeader from "@/components/shared/page-header";
import DataTable from "@/components/data-table-components/DataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { columns } from "./columns";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";

export default async function page() {
  const marketsData = await getData("markets");
  const markets = asArray(marketsData);

  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Markets"
        actions={
          <DashboardActionButton
            label="Add Market"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/markets/new"
          />
        }
      />
      <div className="py-0">
        <DataTable data={markets} columns={columns} />
      </div>
    </div>
  );
}