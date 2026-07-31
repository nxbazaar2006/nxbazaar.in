import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductScanner } from "@/components/products/product-scanner";

export default async function ProductScanPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Scan Product</h1>
        <p className="text-sm text-muted-foreground">
          Scan a product code, SKU, or barcode to open its history.
        </p>
      </div>
      <ProductScanner />
    </main>
  );
}
