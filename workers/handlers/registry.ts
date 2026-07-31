import type { EntityTranslationHandlerRegistry } from "@/workers/handlers/types";
import { attributeTranslationHandler } from "@/workers/handlers/attribute-translation-handler";
import { attributeValueTranslationHandler } from "@/workers/handlers/attribute-value-translation-handler";
import { bannerTranslationHandler } from "@/workers/handlers/banner-translation-handler";
import { blogTranslationHandler } from "@/workers/handlers/blog-translation-handler";
import { brandTranslationHandler } from "@/workers/handlers/brand-translation-handler";
import { categoryTranslationHandler } from "@/workers/handlers/category-translation-handler";
import { productTranslationHandler } from "@/workers/handlers/product-translation-handler";
import { subcategoryTranslationHandler } from "@/workers/handlers/subcategory-translation-handler";

export const entityTranslationHandlers: EntityTranslationHandlerRegistry = {
  PRODUCT: productTranslationHandler,
  CATEGORY: categoryTranslationHandler,
  SUBCATEGORY: subcategoryTranslationHandler,
  BRAND: brandTranslationHandler,
  ATTRIBUTE: attributeTranslationHandler,
  ATTRIBUTE_VALUE: attributeValueTranslationHandler,
  BLOG: blogTranslationHandler,
  BANNER: bannerTranslationHandler,
};
