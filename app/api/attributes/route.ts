import db from "@/lib/db";
import {
  STANDARD_ATTRIBUTES,
  getStandardAttributeDefinition,
  seedStandardAttributes,
} from "@/lib/seed-attributes";
import { NextResponse, type NextRequest } from "next/server";

function withStandardAttributeDefaults(attribute: any) {
  const standard = getStandardAttributeDefinition(attribute.slug);

  if (!standard) {
    return {
      ...attribute,
      inputType: attribute.inputType ?? "SELECT",
      isVariant: attribute.isVariant ?? false,
      isRequired: attribute.isRequired ?? false,
      values: attribute.values ?? [],
    };
  }

  return {
    ...attribute,
    inputType: attribute.inputType ?? standard.inputType,
    isVariant: attribute.isVariant ?? standard.isVariant,
    isRequired: attribute.isRequired ?? standard.isRequired ?? false,
    values: attribute.values ?? [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // Proactively top up the standard master attributes when missing or inactive.
    try {
      const totalCount = await db.attribute.count();
      const activeCount = await db.attribute.count({ where: { isActive: true } });
      if (
        totalCount === 0 ||
        activeCount === 0 ||
        totalCount < STANDARD_ATTRIBUTES.length
      ) {
        await seedStandardAttributes();
      }
    } catch (seedErr) {
      console.warn("ATTRIBUTES_AUTO_SEED_WARN:", seedErr);
    }

    let attributes;

    if (categoryId) {
      try {
        const categoryAttributes = await db.categoryAttribute.findMany({
          where: { categoryId },
          include: {
            attribute: {
              include: {
                values: {
                  where: { isActive: true },
                  orderBy: { position: "asc" },
                },
              },
            },
          },
          orderBy: { position: "asc" },
        });

        if (categoryAttributes.length > 0) {
          attributes = categoryAttributes
            .filter((ca) => ca.attribute && ca.attribute.isActive)
            .map((ca) => {
              const attribute = withStandardAttributeDefaults(ca.attribute);
              return {
                ...attribute,
                isRequired: ca.isRequired || attribute.isRequired,
              };
            });
        }
      } catch (catErr) {
        console.warn("CATEGORY_ATTRIBUTES_QUERY_WARN:", catErr);
      }
    }

    // Fallback: If no category attributes are specifically mapped, return all active attributes
    if (!attributes || attributes.length === 0) {
      attributes = await db.attribute.findMany({
        where: { isActive: true },
        include: {
          values: {
            where: { isActive: true },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    attributes = attributes.map(withStandardAttributeDefaults);

    return NextResponse.json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    console.error("ATTRIBUTES_FETCH_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: String((error as Error)?.message || "Failed to fetch attributes master list."),
        data: [],
      },
      { status: 500 }
    );
  }
}
