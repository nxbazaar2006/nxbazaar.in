import type { Prisma } from "@prisma/client";

type HsnRateFields = "gstRate" | "cgstRate" | "sgstRate" | "igstRate" | "cessRate";
type HsnCodeDateFields = "effectiveTo" | "createdAt" | "updatedAt";
type HsnHistoryDateFields = "effectiveFrom" | "effectiveTo" | "createdAt";

type SerializedHsnRates = Record<HsnRateFields, number>;

export type HsnCodeWithCount = Prisma.HsnCodeGetPayload<{
  include: {
    _count: {
      select: {
        categories: true;
        subCategories: true;
        products: true;
      };
    };
  };
}>;

export type HsnCodeTaxRecord = Prisma.HsnCodeGetPayload<{
  select: {
    id: true;
    code: true;
    description: true;
    gstRate: true;
    cgstRate: true;
    sgstRate: true;
    igstRate: true;
    cessRate: true;
    taxType: true;
    status: true;
    chapter: true;
    effectiveTo: true;
  };
}>;

export type HsnCodeRecord = Prisma.HsnCodeGetPayload<object>;
export type HsnRateHistoryRecord = Prisma.HsnRateHistoryGetPayload<object>;

export type HsnCodeDetailRecord = Prisma.HsnCodeGetPayload<{
  include: {
    categories: { select: { id: true; title: true; slug: true } };
    subCategories: { select: { id: true; title: true; slug: true } };
    products: { select: { id: true; title: true; slug: true } };
    rateHistory: true;
  };
}>;

export type HsnCodeRow = Omit<HsnCodeRecord, HsnRateFields | HsnCodeDateFields> &
  SerializedHsnRates & {
    effectiveTo: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };

export type HsnTableRow = Omit<HsnCodeWithCount, HsnRateFields | HsnCodeDateFields> &
  SerializedHsnRates & {
    effectiveTo: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };

export type HsnRateHistoryRow = Omit<HsnRateHistoryRecord, HsnRateFields | HsnHistoryDateFields> &
  SerializedHsnRates & {
    effectiveFrom: string | null;
    effectiveTo: string | null;
    createdAt: string | null;
  };

export type HsnDetailRow = Omit<HsnCodeDetailRecord, HsnRateFields | HsnCodeDateFields | "rateHistory"> &
  SerializedHsnRates & {
    effectiveTo: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    rateHistory: HsnRateHistoryRow[];
  };
