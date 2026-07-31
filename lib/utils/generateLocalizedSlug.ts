import { LanguageCode } from "@/lib/i18n/languages";

const transliterationMap: Record<string, string> = {
  "\u0905": "a",
  "\u0906": "aa",
  "\u0907": "i",
  "\u0908": "ee",
  "\u0909": "u",
  "\u090a": "oo",
  "\u090b": "ri",
  "\u090f": "e",
  "\u0910": "ai",
  "\u0913": "o",
  "\u0914": "au",
  "\u0915": "k",
  "\u0916": "kh",
  "\u0917": "g",
  "\u0918": "gh",
  "\u091a": "ch",
  "\u091b": "chh",
  "\u091c": "j",
  "\u091d": "jh",
  "\u091f": "t",
  "\u0920": "th",
  "\u0921": "d",
  "\u0922": "dh",
  "\u0923": "n",
  "\u0924": "t",
  "\u0925": "th",
  "\u0926": "d",
  "\u0927": "dh",
  "\u0928": "n",
  "\u092a": "p",
  "\u092b": "ph",
  "\u092c": "b",
  "\u092d": "bh",
  "\u092e": "m",
  "\u092f": "y",
  "\u0930": "r",
  "\u0932": "l",
  "\u0935": "v",
  "\u0936": "sh",
  "\u0937": "sh",
  "\u0938": "s",
  "\u0939": "h",
  "\u0933": "l",
  "\u093e": "a",
  "\u093f": "i",
  "\u0940": "ee",
  "\u0941": "u",
  "\u0942": "oo",
  "\u0943": "ri",
  "\u0947": "e",
  "\u0948": "ai",
  "\u094b": "o",
  "\u094c": "au",
  "\u0902": "n",
  "\u0901": "n",
  "\u0903": "h",
  "\u0945": "e",
  "\u0949": "o",
  "\u094d": "",
  "\u0964": " ",
};

export function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function transliterateIndic(value: string) {
  return Array.from(value)
    .map((char) => transliterationMap[char] ?? char)
    .join("");
}

export function generateLocalizedSlug(title: string, language: LanguageCode = "en") {
  const source = language === "en" ? title : transliterateIndic(title);
  return cleanSlug(source);
}

export function withNumericSlugSuffix(baseSlug: string, usedSlugs: Set<string>) {
  let nextSlug = baseSlug || "item";
  let suffix = 2;

  while (usedSlugs.has(nextSlug)) {
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(nextSlug);
  return nextSlug;
}
