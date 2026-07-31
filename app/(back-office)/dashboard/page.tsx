import { auth } from "@/auth";
import DashboardCharts from "@/components/backoffice/DashboardCharts";
import FarmerDashboard from "@/components/backoffice/FarmerDashboard";
import LargeCards from "@/components/backoffice/LargeCards";
import SmallCards from "@/components/backoffice/SmallCards";
import UserDashboard from "@/components/backoffice/UserDashboard";
import { GlassText } from "@/components/ui/glass-text";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const [salesData, ordersData, productsData] = await Promise.all([
    getData("sales"),
    getData("orders"),
    getData("products"),
  ]);
  const sales = asArray(salesData);
  const orders = asArray(ordersData);
  const products = asArray(productsData);
  void products;

  if (role === "USER") return <UserDashboard />;
  if (role === "FARMER") return <FarmerDashboard />;

  return (
    <section className="liquid-card dashboard-cyan-glass w-full min-w-0 p-6 text-[#103c55] sm:p-8">
      <div className="relative z-10 space-y-8">
        <GlassText
          variant="dark"
          title="Dashboard"
          headingAs="h1"
          headingClassName="text-3xl sm:text-4xl"
        />
        <LargeCards sales={sales} />
        <SmallCards orders={orders} />
        <DashboardCharts sales={sales} />
      </div>
    </section>
  );
}
