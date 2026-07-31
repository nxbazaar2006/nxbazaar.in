import type { LooseApiData } from "@/lib/getData";

export function asArray<T = LooseApiData>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export function getApiMessage(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return null;
}
