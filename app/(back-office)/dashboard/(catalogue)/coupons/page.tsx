import { auth } from "@/auth";
import PageHeader from "@/components/shared/page-header";
import DataTable from "@/components/data-table-components/DataTable";
import { DashboardActionButton } from "@/components/ui/DashboardActionButton";
import { getData } from "@/lib/getData";
import { columns } from "./columns";
import { asArray } from "@/lib/normalizeApiData";
import { Plus } from "lucide-react";

export default async function Coupons() {
  const session = await auth();
  const id = session?.user?.id;
  const role = session?.user?.role;
  const allCouponsData = await getData("coupons");
  const allCoupons = asArray(allCouponsData);
  const farmerCoupons = allCoupons.filter((coupon) => coupon.vendorId === id);

  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Coupons"
        actions={
          <DashboardActionButton
            label="Add Coupon"
            icon={<Plus className="h-4 w-4 text-white" />}
            variant="primary"
            href="/dashboard/coupons/new"
          />
        }
      />
      <div className="py-8">
        {role === "ADMIN" ? (
          <DataTable data={allCoupons} columns={columns} />
        ) : (
          <DataTable data={farmerCoupons} columns={columns} />
        )}
      </div>
    </div>
  );
}
