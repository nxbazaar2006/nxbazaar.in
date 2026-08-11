import { auth } from "@/auth";
import db from "@/lib/db";
import { ProductHistoryAction, ProductStatus, TaxMappingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { buildEnglishTranslationPayload, prismaUniqueMessage } from "@/lib/i18n/translationPayload";
import { safelyEnqueueTranslationJobs } from "@/lib/queues/safe-translation-enqueue";
import { createTranslationSourceHash } from "@/lib/translations/source-hash";
import { assertUniqueVariantIdentifiers, syncProductAttributesAndVariants, toNullableNumber, toNumber, validateProductVariantPayload,
} from "@/lib/product-variants";
import { applyServerGeneratedProductIdentifiers } from "@/lib/product-identifiers";
import { createProductHistory, historyActorFromSession, historyBase } from "@/lib/product-history";
import { NextResponse } from "next/server";
import { productTaxRelationSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache"; import { getImageUrls, getSingleImageUrl } from "@/lib/image-utils";
const productInclude = { category: { include: { hsnCode: true, translations: true } }, subCategory: { include: { hsnCode: true, translations: true } }, hsnCode: true, translations: true, attributes: { orderBy: { position: "asc" }, include: { values: { orderBy: { position: "asc" } } }, }, variants: { orderBy: { createdAt: "asc" }, include: { values: { include: { attribute: true, attributeValue: true, }, }, }, },
} satisfies Prisma.ProductInclude; function toProductListItem(product) { const activeVariants = (product.variants || []).filter((variant) => variant.isActive); const prices = activeVariants.map((variant) => Number(variant.price)).filter(Number.isFinite); const totalStock = product.productType === "VARIABLE" ? activeVariants.reduce((sum, variant) => sum + (variant.stock || 0), 0) : product.productStock || 0; const productImages = getImageUrls(product.productImages, product.imageUrl); const imageUrl = getSingleImageUrl(product.imageUrl || productImages[0]); return { ...product, imageUrl, productImages, variantCount: activeVariants.length, totalStock, minVariantPrice: prices.length ? Math.min(...prices) : null, maxVariantPrice: prices.length ? Math.max(...prices) : null, };
}
function buildProductData(payload) { const productImages = getImageUrls(payload.productImages, payload.imageUrl); const imageUrl = getSingleImageUrl(payload.imageUrl || productImages[0]); return { barcode: null, categoryId: payload.categoryId, subCategoryId: payload.subCategoryId || null, hsnCodeId: payload.hsnCodeId, hsnOverrideEnabled: Boolean(payload.hsnOverrideEnabled), description: payload.description || null, userId: payload.farmerId || payload.userId, productType: payload.productType || "SIMPLE", productImages, imageUrl, isActive: Boolean(payload.isActive), isWholesale: Boolean(payload.isWholesale), productCode: null, productPrice: toNumber(payload.productPrice, 0), salePrice: toNumber(payload.salePrice, 0), sku: null, slug: payload.slug, tags: payload.tags || [], title: payload.title, unit: payload.unit || null, wholesalePrice: toNullableNumber(payload.wholesalePrice), wholesaleQty: payload.wholesaleQty ? parseInt(payload.wholesaleQty, 10) : null, productStock: payload.productStock ? parseInt(payload.productStock, 10) : 0, qty: payload.qty ? parseInt(payload.qty, 10) : 1, aiGenerated: Boolean(payload.aiGenerated), aiConfidence: payload.aiConfidence === undefined ? null : toNullableNumber(payload.aiConfidence), aiMetadata: payload.aiMetadata || null, taxMappingStatus: TaxMappingStatus.PENDING_REVIEW as TaxMappingStatus, status: undefined as ProductStatus | undefined, };
}
async function validateProductTaxRelations(payload) { const parsed = productTaxRelationSchema.safeParse(payload); if (!parsed.success) { return { ok: false, message: parsed.error.issues.map((issue) => issue.message).join(". "), }; } const { categoryId, subCategoryId, hsnCodeId } = parsed.data; const [category, subCategory] = await Promise.all([ db.category.findFirst({ where: { id: categoryId, isActive: true }, select: { id: true, title: true, hsnCode: { select: { id: true, status: true, effectiveTo: true }, }, }, }), subCategoryId ? db.subCategory.findFirst({ where: { id: subCategoryId, isActive: true }, select: { id: true, title: true, categoryId: true, hsnCode: { select: { id: true, status: true, effectiveTo: true }, }, }, }) : Promise.resolve(null), ]); if (!category) return { ok: false, message: "Selected category is invalid or inactive." }; if (!subCategory) return { ok: false, message: "Selected subcategory is invalid or inactive." }; if (subCategory.categoryId !== categoryId) { return { ok: false, message: "Selected subcategory does not belong to the selected category", }; } const activeMappedHsn = [subCategory.hsnCode, category.hsnCode].find( (hsn) => hsn?.status === "ACTIVE" && (!hsn.effectiveTo || hsn.effectiveTo >= new Date()) ); if (hsnCodeId) { const hsnCode = await db.hsnCode.findFirst({ where: { id: hsnCodeId, status: "ACTIVE", AND: [ { OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] }, { OR: [ { subCategories: { some: { id: subCategoryId, categoryId, isActive: true } } }, { categories: { some: { id: categoryId, isActive: true } } }, ], }, ], }, select: { id: true }, }); if (hsnCode) { return { ok: true, hsnCodeId: hsnCode.id, taxMappingStatus: TaxMappingStatus.MAPPED, categoryTitle: category.title, subCategoryTitle: subCategory.title, }; } } return { ok: true, hsnCodeId: activeMappedHsn?.id ?? null, taxMappingStatus: activeMappedHsn ? TaxMappingStatus.MAPPED : TaxMappingStatus.PENDING_REVIEW, categoryTitle: category.title, subCategoryTitle: subCategory.title, };
}
export async function POST(request) { try { const session = await auth(); if (!session?.user) { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); } const payload = await request.json(); delete payload.productCode; delete payload.sku; const taxValidation = await validateProductTaxRelations(payload); if (!taxValidation.ok) { return NextResponse.json({ message: taxValidation.message }, { status: 400 }); } const productData = buildProductData(payload); const seller = productData.userId ? await db.user.findUnique({ where: { id: productData.userId }, select: { id: true, name: true, email: true }, }) : null; productData.hsnCodeId = taxValidation.hsnCodeId; productData.taxMappingStatus = taxValidation.taxMappingStatus; if (taxValidation.taxMappingStatus === TaxMappingStatus.PENDING_REVIEW) { productData.isActive = false; productData.status = ProductStatus.PENDING_REVIEW; } const englishTranslation = buildEnglishTranslationPayload( { title: productData.title, slug: productData.slug, shortDescription: payload.shortDescription ?? null, description: productData.description, }, { includeShortDescription: true } ); const sourceHash = createTranslationSourceHash(englishTranslation); if (session.user.role !== "ADMIN" && productData.userId !== session.user.id) { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); } const { errors, attributes } = validateProductVariantPayload({ productType: productData.productType, attributes: payload.attributes, variants: payload.variants, }); if (errors.length) { return NextResponse.json({ message: errors.join(" ") }, { status: 400 }); } //Check if this product already exists in the db
const existingProduct = await db.product.findUnique({ where: { slug: productData.slug, }, }); if (existingProduct) { return NextResponse.json( { data: null, message: `Product ( ${productData.title}) already exists in the Database`, }, { status: 409 } ); }

    const translationEntries = payload.translations && typeof payload.translations === "object"
      ? Object.entries(payload.translations).map(([lang, t]: [string, any]) => ({
          language: lang,
          title: t.title || englishTranslation.title,
          slug: t.slug || englishTranslation.slug,
          description: t.descriptionHtml || englishTranslation.description,
          descriptionJson: t.descriptionJson || null,
          shortDescription: t.shortDescription || englishTranslation.shortDescription,
          keyFeatures: t.keyFeatures || null,
          metaTitle: t.metaTitle || englishTranslation.metaTitle,
          metaDescription: t.metaDescription || englishTranslation.metaDescription,
          seoKeywords: Array.isArray(t.seoKeywords) ? t.seoKeywords : [],
          status: t.status || "DRAFT",
          generatedByAI: Boolean(t.generatedByAI),
        }))
      : [
          {
            language: englishTranslation.language,
            title: englishTranslation.title,
            slug: englishTranslation.slug,
            description: englishTranslation.description,
            shortDescription: englishTranslation.shortDescription,
            metaTitle: englishTranslation.metaTitle,
            metaDescription: englishTranslation.metaDescription,
          },
        ];

    const newProduct = await db.$transaction(async (prisma) => {
      await applyServerGeneratedProductIdentifiers({
        prisma,
        payload,
        productData,
        categoryTitle: taxValidation.categoryTitle || "",
        subCategoryTitle: taxValidation.subCategoryTitle || "",
      });

      await assertUniqueVariantIdentifiers(prisma, payload.variants || [], null);

      const product = await prisma.product.create({
        data: {
          ...productData,
          translations: {
            create: translationEntries,
          },
        },
      });

      const actor = await historyActorFromSession(session);
      const productHistoryBase = historyBase({ ...product, actor });

      await createProductHistory(prisma, {
        ...productHistoryBase,
        action: ProductHistoryAction.PRODUCT_CREATED,
        oldValue: null,
        newValue: {
          title: product.title,
          productCode: product.productCode,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          sellerId: product.userId,
          brand: product.brandId,
          tags: product.tags,
          status: product.status,
        },
      });

      await syncProductAttributesAndVariants({
        prisma,
        productId: product.id,
        productType: product.productType,
        attributes,
        variants: payload.variants || [],
        actor,
      });

      return prisma.product.findUnique({ where: { id: product.id }, include: productInclude });
    }); if (newProduct) { await safelyEnqueueTranslationJobs({ entityType: "PRODUCT", entityId: newProduct.id, sourceHash, requestedByUserId: session.user.id, }); } revalidatePath("/dashboard/products"); revalidatePath("/dashboard/products/new"); return NextResponse.json(newProduct); } catch (error) { console.error(error); return NextResponse.json( { message: prismaUniqueMessage(error, "Failed to create Product"), error, }, { status: 500 } ); }
}
export async function GET(request) { const categoryId = request.nextUrl.searchParams.get("catId"); const subCategory = request.nextUrl.searchParams.get("subCategory"); const sortBy = request.nextUrl.searchParams.get("sort"); const min = request.nextUrl.searchParams.get("min"); const max = request.nextUrl.searchParams.get("max"); const page = request.nextUrl.searchParams.get("page") || "1"; const pageSize = 3; let where: Prisma.ProductWhereInput = categoryId ? { categoryId } : {}; if (subCategory) { where.subCategory = { slug: subCategory, }; } if (min && max) { where.salePrice = { gte: parseFloat(min), lte: parseFloat(max), }; } else if (min) { where.salePrice = { gte: parseFloat(min), }; } else if (max) { where.salePrice = { lte: parseFloat(max), }; } let products; try { if (categoryId && sortBy) { products = await db.product.findMany({ where, include: productInclude, skip: (parseInt(page) - 1) * pageSize, take: pageSize, orderBy: { salePrice: sortBy === "asc" ? "asc" : "desc", }, }); } else if (categoryId) { products = await db.product.findMany({ where, include: productInclude, skip: (parseInt(page) - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc", }, }); } else { products = await db.product.findMany({ skip: (parseInt(page) - 1) * pageSize, take: pageSize, include: productInclude, orderBy: { createdAt: "desc", }, }); } return NextResponse.json(products.map(toProductListItem)); } catch (error) { console.error(error); return NextResponse.json( { message: "Failed to Fetch Products", error, }, { status: 500 } ); }
}
