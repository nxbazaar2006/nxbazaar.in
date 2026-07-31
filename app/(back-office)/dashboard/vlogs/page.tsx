import PageHeader from "@/components/shared/page-header";
import DataTable from "@/components/data-table-components/DataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { columns } from "../community/columns";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";

export default async function VlogsPage() {
  const trainingsData = await getData("trainings");
  const trainings = asArray(trainingsData);

  return (
    <div>
      <PageHeader
        heading="Vlogs Management"
        actions={
          <DashboardActionButton
            label="Add Vlog"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/vlogs/new"
          />
        }
      />
      <div className="py-0">
        <DataTable data={trainings} columns={columns} />
      </div>
    </div>
  );
}
