export const DEFAULT_FALLBACK_IMAGE = "/vegetables.png";

/**
 * Normalizes a single image URL string by splitting on delimiters [;,|]
 * and returning the first valid URL string, or a fallback.
 */
export function getSingleImageUrl(
  imageUrl?: string | null,
  fallback = DEFAULT_FALLBACK_IMAGE
): string {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
    return fallback;
  }
  const parts = imageUrl
    .split(/[;,|]/)
    .map((url) => url.trim())
    .filter(Boolean);

  return parts[0] || fallback;
}

/**
 * Normalizes product images input (array or pipe-delimited string) and thumbnail
 * into a clean array of single image URL strings.
 */
export function getImageUrls(
  productImages?: (string | null | undefined)[] | string | null,
  thumbnail?: string | null,
  fallback = DEFAULT_FALLBACK_IMAGE
): string[] {
  const urls: string[] = [];

  if (typeof productImages === "string") {
    const parts = productImages
      .split(/[;,|]/)
      .map((url) => url.trim())
      .filter(Boolean);
    urls.push(...parts);
  } else if (Array.isArray(productImages)) {
    for (const item of productImages) {
      if (typeof item === "string" && item.trim()) {
        const parts = item
          .split(/[;,|]/)
          .map((url) => url.trim())
          .filter(Boolean);
        urls.push(...parts);
      }
    }
  }

  if (urls.length === 0 && typeof thumbnail === "string" && thumbnail.trim()) {
    const parts = thumbnail
      .split(/[;,|]/)
      .map((url) => url.trim())
      .filter(Boolean);
    urls.push(...parts);
  }

  return urls.length > 0 ? urls : [fallback];
}
