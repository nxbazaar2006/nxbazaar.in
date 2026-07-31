import FormHeader from "@/components/backoffice/FormHeader";
import ProductBarcodeScanner from "@/components/backoffice/ProductBarcodeScanner";
import { Suspense } from "react";

export default function ProductScannerPage() {
  return (
    <div>
      <FormHeader title="Barcode Scanner" />
      <Suspense fallback={<div className="p-4">Loading scanner...</div>}>
        <ProductBarcodeScanner />
      </Suspense>
    </div>
  );
}
