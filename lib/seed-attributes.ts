import db from "@/lib/db";
import { generateSlug } from "@/lib/generateSlug";

export type AttributeInputType = "SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "BOOLEAN";

export type StandardAttributeDefinition = {
  name: string;
  inputType: AttributeInputType;
  isVariant: boolean;
  isRequired?: boolean;
  values: Array<{
    value: string;
    colorCode?: string;
  }>;
};

export const STANDARD_ATTRIBUTES: StandardAttributeDefinition[] = [
  {
    name: "Brand",
    inputType: "SELECT",
    isVariant: false,
    isRequired: false,
    values: [
      { value: "Apple" },
      { value: "Samsung" },
      { value: "Nike" },
      { value: "Adidas" },
      { value: "Puma" },
      { value: "Sony" },
      { value: "LG" },
      { value: "Generic" },
    ],
  },
  {
    name: "Color",
    inputType: "MULTI_SELECT",
    isVariant: true,
    isRequired: false,
    values: [
      { value: "Red", colorCode: "#FF0000" },
      { value: "Blue", colorCode: "#0000FF" },
      { value: "Green", colorCode: "#008000" },
      { value: "Black", colorCode: "#000000" },
      { value: "White", colorCode: "#FFFFFF" },
      { value: "Yellow", colorCode: "#FFFF00" },
      { value: "Pink", colorCode: "#FFC0CB" },
      { value: "Purple", colorCode: "#800080" },
      { value: "Grey", colorCode: "#808080" },
      { value: "Silver", colorCode: "#C0C0C0" },
      { value: "Gold", colorCode: "#FFD700" },
    ],
  },
  {
    name: "Size",
    inputType: "MULTI_SELECT",
    isVariant: true,
    isRequired: false,
    values: [
      { value: "XS" },
      { value: "S" },
      { value: "M" },
      { value: "L" },
      { value: "XL" },
      { value: "XXL" },
      { value: "3XL" },
    ],
  },
  {
    name: "Material",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Cotton" },
      { value: "Polyester" },
      { value: "Leather" },
      { value: "Silk" },
      { value: "Wool" },
      { value: "Denim" },
      { value: "Linen" },
      { value: "Plastic" },
      { value: "Metal" },
      { value: "Stainless Steel" },
    ],
  },
  {
    name: "Pattern",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Solid" },
      { value: "Printed" },
      { value: "Striped" },
      { value: "Checkered" },
      { value: "Floral" },
      { value: "Polka Dot" },
    ],
  },
  {
    name: "Style",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Casual" },
      { value: "Formal" },
      { value: "Party" },
      { value: "Sports" },
      { value: "Ethnic" },
    ],
  },
  {
    name: "Fit",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Regular Fit" },
      { value: "Slim Fit" },
      { value: "Relaxed Fit" },
      { value: "Oversized" },
    ],
  },
  {
    name: "Sleeve Type",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Full Sleeve" },
      { value: "Half Sleeve" },
      { value: "Sleeveless" },
      { value: "3/4th Sleeve" },
    ],
  },
  {
    name: "Neck Type",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Round Neck" },
      { value: "V-Neck" },
      { value: "Polo / Collar" },
      { value: "Turtleneck" },
      { value: "Hooded" },
    ],
  },
  {
    name: "Gender",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Men" },
      { value: "Women" },
      { value: "Unisex" },
      { value: "Boys" },
      { value: "Girls" },
    ],
  },
  {
    name: "Age Group",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Adult" },
      { value: "Teens" },
      { value: "Kids" },
      { value: "Infant" },
    ],
  },
  {
    name: "RAM",
    inputType: "MULTI_SELECT",
    isVariant: true,
    values: [
      { value: "4 GB" },
      { value: "6 GB" },
      { value: "8 GB" },
      { value: "12 GB" },
      { value: "16 GB" },
      { value: "32 GB" },
    ],
  },
  {
    name: "Storage",
    inputType: "MULTI_SELECT",
    isVariant: true,
    values: [
      { value: "64 GB" },
      { value: "128 GB" },
      { value: "256 GB" },
      { value: "512 GB" },
      { value: "1 TB" },
    ],
  },
  {
    name: "Weight",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "100g" },
      { value: "250g" },
      { value: "500g" },
      { value: "1 kg" },
      { value: "2 kg" },
      { value: "5 kg" },
    ],
  },
  {
    name: "Pack Size",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "Pack of 1" },
      { value: "Pack of 2" },
      { value: "Pack of 3" },
      { value: "Pack of 5" },
      { value: "Pack of 10" },
    ],
  },
  {
    name: "Warranty",
    inputType: "SELECT",
    isVariant: false,
    values: [
      { value: "No Warranty" },
      { value: "6 Months Brand Warranty" },
      { value: "1 Year Brand Warranty" },
      { value: "2 Years Brand Warranty" },
    ],
  },
];

export function getStandardAttributeDefinition(slug: string) {
  return STANDARD_ATTRIBUTES.find((def) => generateSlug(def.name) === slug);
}

async function upsertAttributeWithSupportedFields(
  slug: string,
  updateData: Record<string, unknown>,
  createData: Record<string, unknown>
) {
  const update = { ...updateData };
  const create = { ...createData };
  const unsupportedFields = new Set<string>();

  while (true) {
    try {
      return await db.attribute.upsert({
        where: { slug },
        update: update as any,
        create: create as any,
      });
    } catch (error) {
      const message = String((error as Error)?.message || error);
      const match = message.match(/Unknown argument `([^`]+)`/);

      if (!match) {
        throw error;
      }

      const field = match[1];
      if (unsupportedFields.has(field)) {
        throw error;
      }

      unsupportedFields.add(field);
      delete update[field];
      delete create[field];
    }
  }
}

export async function seedStandardAttributes() {
  for (const def of STANDARD_ATTRIBUTES) {
    const slug = generateSlug(def.name);

    const updateData: Record<string, unknown> = {
      name: def.name,
      isVariant: def.isVariant,
      isRequired: def.isRequired ?? false,
      inputType: def.inputType,
    };

    const createData: Record<string, unknown> = {
      name: def.name,
      slug,
      isVariant: def.isVariant,
      isRequired: def.isRequired ?? false,
      inputType: def.inputType,
    };

    const attribute = await upsertAttributeWithSupportedFields(slug, updateData, createData);

    for (let index = 0; index < def.values.length; index++) {
      const val = def.values[index];
      const valueSlug = generateSlug(val.value);
      await db.attributeValue.upsert({
        where: {
          attributeId_slug: {
            attributeId: attribute.id,
            slug: valueSlug,
          },
        },
        update: {
          value: val.value,
          colorCode: val.colorCode || null,
          position: index,
        },
        create: {
          attributeId: attribute.id,
          value: val.value,
          slug: valueSlug,
          colorCode: val.colorCode || null,
          position: index,
        },
      });
    }
  }
}
