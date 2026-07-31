"use client";

type BarcodeActionsProps = {
  barcode: string | null | undefined;
  label?: string;
};

function barcodeImageUrl(barcode: string) {
  return `/api/barcode?text=${encodeURIComponent(barcode)}`;
}

export function BarcodeActions({ barcode, label = "barcode" }: BarcodeActionsProps) {
  if (!barcode) return null;

  const imageUrl = barcodeImageUrl(barcode);

  function printBarcode() {
    const printWindow = window.open("", "_blank", "width=420,height=320");

    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${label}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; text-align: center; }
            img { max-width: 100%; height: auto; }
            .code { margin-top: 12px; font-size: 12px; letter-spacing: 0; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="${label}" />
          <div class="code">${barcode}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={printBarcode}>
        Print Barcode
      </button>
      <a
        className="rounded-md border px-3 py-2 text-sm"
        href={imageUrl}
        download={`${barcode}.png`}
      >
        Download Barcode
      </a>
    </div>
  );
}
