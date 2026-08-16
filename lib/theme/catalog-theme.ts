export const NX_MAIN_THEME_FAMILIES = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
] as const;

export type NxThemeFamily = (typeof NX_MAIN_THEME_FAMILIES)[number];

export type CatalogThemeInput = {
  departmentId?: string | null;
  departmentSlug?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  subCategoryId?: string | null;
  subCategorySlug?: string | null;
};

const SUB_SHADE_COUNT = 12;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function keyOf(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(":").toLowerCase();
}

export function getDepartmentThemeFamily(input: CatalogThemeInput): NxThemeFamily {
  const key = keyOf(input.departmentId, input.departmentSlug) || "nxbazaar";
  return NX_MAIN_THEME_FAMILIES[stableHash(key) % NX_MAIN_THEME_FAMILIES.length];
}

export function getCategoryThemeShade(input: CatalogThemeInput) {
  const key = keyOf(
    input.departmentId,
    input.departmentSlug,
    input.categoryId,
    input.categorySlug,
  ) || "category";

  return (stableHash(key) % SUB_SHADE_COUNT) + 1;
}

export function getSubCategoryThemeShade(input: CatalogThemeInput) {
  const categoryShade = getCategoryThemeShade(input);
  const key = keyOf(input.subCategoryId, input.subCategorySlug) || "subcategory";
  const offset = (stableHash(key) % 5) - 2;

  return Math.min(SUB_SHADE_COUNT, Math.max(1, categoryShade + offset));
}

export function getCatalogTheme(input: CatalogThemeInput) {
  const family = getDepartmentThemeFamily(input);
  const categoryShade = getCategoryThemeShade(input);
  const subCategoryShade = getSubCategoryThemeShade(input);

  return {
    family,
    departmentClassName: `nx-theme-${family}`,
    categoryClassName: `nx-theme-${family} nx-theme-shade-${categoryShade}`,
    subCategoryClassName: `nx-theme-${family} nx-theme-shade-${subCategoryShade}`,
    categoryShade,
    subCategoryShade,
  } as const;
}
