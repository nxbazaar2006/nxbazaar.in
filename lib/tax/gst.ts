import { Prisma, type TaxTreatment } from "@prisma/client";

export type CalculateGstInput = {
  taxableAmount: number | string | Prisma.Decimal;
  gstRate: number | string | Prisma.Decimal;
  sellerStateCode?: string | null;
  customerStateCode?: string | null;
  taxTreatment: TaxTreatment;
};

export type CalculatedGst = {
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
};

function toDecimal(value: number | string | Prisma.Decimal) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value || 0);
}

function roundMoney(value: Prisma.Decimal) {
  return Number(value.toDecimalPlaces(2).toString());
}

function normalizeState(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function calculateGst(input: CalculateGstInput): CalculatedGst {
  const taxableAmount = toDecimal(input.taxableAmount);
  const gstRate = toDecimal(input.gstRate);

  if (
    input.taxTreatment === "NIL_RATED" ||
    input.taxTreatment === "EXEMPT" ||
    input.taxTreatment === "NON_GST"
  ) {
    return {
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
    };
  }

  const sellerState = normalizeState(input.sellerStateCode);
  const customerState = normalizeState(input.customerStateCode);
  const isInterState = Boolean(sellerState && customerState && sellerState !== customerState);

  if (isInterState) {
    const igstAmount = roundMoney(taxableAmount.mul(gstRate).div(100));
    return {
      cgstRate: 0,
      sgstRate: 0,
      igstRate: Number(gstRate.toString()),
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalTax: igstAmount,
    };
  }

  const halfRate = gstRate.div(2);
  const cgstAmount = roundMoney(taxableAmount.mul(halfRate).div(100));
  const sgstAmount = roundMoney(taxableAmount.mul(halfRate).div(100));
  return {
    cgstRate: Number(halfRate.toString()),
    sgstRate: Number(halfRate.toString()),
    igstRate: 0,
    cgstAmount,
    sgstAmount,
    igstAmount: 0,
    totalTax: roundMoney(new Prisma.Decimal(cgstAmount).plus(sgstAmount)),
  };
}
