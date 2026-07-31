import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hsnCodes = [
  {
    code: "6109",
    description: "T-shirts, singlets and other vests",
    gstRate: 5,
    cgstRate: 2.5,
    sgstRate: 2.5,
    igstRate: 5,
  },
  {
    code: "6110",
    description: "Jerseys, pullovers and cardigans",
    gstRate: 12,
    cgstRate: 6,
    sgstRate: 6,
    igstRate: 12,
  },
  {
    code: "6203",
    description: "Men's suits, jackets and trousers",
    gstRate: 12,
    cgstRate: 6,
    sgstRate: 6,
    igstRate: 12,
  },
  {
    code: "6204",
    description: "Women's suits, dresses and skirts",
    gstRate: 12,
    cgstRate: 6,
    sgstRate: 6,
    igstRate: 12,
  },
  {
    code: "8517",
    description: "Telephones and communication devices",
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  },
  {
    code: "8471",
    description: "Computers and data processing machines",
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  },
  {
    code: "9403",
    description: "Furniture and parts",
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  },
];

const load = async () => {
  try {
    for (const hsnCode of hsnCodes) {
      await prisma.hsnCode.upsert({
        where: { code: hsnCode.code },
        update: {},
        create: {
          ...hsnCode,
          cessRate: 0,
          taxType: "TAXABLE",
          keywords: [],
          status: "ACTIVE",
        },
      });
    }

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
