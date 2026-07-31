export type QrScanSource =
  | "PRODUCT_LABEL"
  | "WAREHOUSE"
  | "INVOICE"
  | "PACKAGING"
  | "CUSTOMER"
  | "SELLER"
  | "ADMIN";

export type QrFormat = "png" | "svg";

export type ProductQrCodeProps = {
  productCode: string;
  sku?: string;
  productTitle?: string;
  size?: number;
  showDownload?: boolean;
  showPrint?: boolean;
  showValue?: boolean;
  className?: string;
  isAdmin?: boolean;
};

export type QrOptions = {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
};

export type ProductQrScanPayload = {
  productId: string;
  variantId?: string | null;
  productCode: string;
  sku?: string | null;
  userId?: string | null;
  source?: QrScanSource | string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type QrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    productCode: string;
    title: string;
    imageUrl?: string | null;
    salePrice?: number;
    user?: {
      sellerProfile?: {
        code?: string | null;
      } | null;
    } | null;
    variants?: Array<{
      id: string;
      sku: string;
      title: string;
      price: number;
    }>;
  };
  defaultSku?: string;
};

export type QrLabelProps = {
  productName: string;
  productCode: string;
  sku?: string;
  price: number;
  sellerCode?: string;
  qrUrl: string;
  labelSize?: "50x30" | "60x40" | "100x50" | "A4";
};
