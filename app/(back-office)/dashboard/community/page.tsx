import PageHeader from "@/components/shared/page-header";
import DataTable from "@/components/data-table-components/DataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { columns } from "./columns";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";

export default async function page() {
  const trainingsData = await getData("trainings");
  const trainings = asArray(trainingsData);

  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Limi Community Trainings"
        actions={
          <DashboardActionButton
            label="Add Training"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/community/new"
          />
        }
      />
      <div className="py-0">
        <DataTable data={trainings} columns={columns} />
      </div>
    </div>
  );
}