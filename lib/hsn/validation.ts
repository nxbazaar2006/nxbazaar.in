import { Prisma } from "@prisma/client";

export function toDecimal(value: number | string | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

export function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export function hasRateChanged(
  oldRates: {
    gstRate?: Prisma.Decimal | number | null;
    cgstRate?: Prisma.Decimal | number | null;
    sgstRate?: Prisma.Decimal | number | null;
    igstRate?: Prisma.Decimal | number | null;
    cessRate?: Prisma.Decimal | number | null;
  },
  newRates: {
    gstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;
    cessRate?: number;
  }
) {
  return (["gstRate", "cgstRate", "sgstRate", "igstRate", "cessRate"] as const).some(
    (key) => decimalToNumber(oldRates[key]) !== Number(newRates[key])
  );
}

export function isActiveHsnStatus(status: string | null | undefined) {
  return status === "ACTIVE";
}
