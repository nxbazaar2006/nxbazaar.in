import { createHash } from "node:crypto";

export type SourceTranslationFields = Record<string, string | null | undefined>;

export function normalizeSourceFields(fields: SourceTranslationFields) {
  return Object.keys(fields)
    .sort()
    .reduce<SourceTranslationFields>((normalized, key) => {
      const value = fields[key];
      normalized[key] = typeof value === "string" ? value.trim() : value ?? null;
      return normalized;
    }, {});
}

export function createTranslationSourceHash(fields: SourceTranslationFields) {
  return createHash("sha256")
    .update(JSON.stringify(normalizeSourceFields(fields)))
    .digest("hex");
}
