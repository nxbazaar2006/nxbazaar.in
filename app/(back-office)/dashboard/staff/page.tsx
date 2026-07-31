import PageHeader from "@/components/shared/page-header";
import TableActions from "@/components/backoffice/TableActions";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { Plus } from "lucide-react";

export default function StaffPage() {
  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Staff"
        actions={
          <DashboardActionButton
            label="Add Staff"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/staff/new"
          />
        }
      />
      {/* Table Actions */}
      <TableActions />
      <div className="py-8">
        <h2>Table</h2>
      </div>
    </div>
  );
}