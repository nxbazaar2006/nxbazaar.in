export function parseStatus(value: unknown) {
  const normalized = String(value ?? "ACTIVE").trim().toUpperCase();
  if (["ACTIVE", "TRUE", "YES", "1"].includes(normalized)) return "ACTIVE";
  if (["INACTIVE", "FALSE", "NO", "0"].includes(normalized)) return "INACTIVE";
  if (normalized === "ARCHIVED") return "ARCHIVED";
  throw new Error("Invalid HSN status.");
}
