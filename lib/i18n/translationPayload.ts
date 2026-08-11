import { z } from "zod";
import { defaultLanguage, supportedLanguages, type LanguageCode } from "@/lib/i18n/languages";
import { generateLocalizedSlug, cleanSlug } from "@/lib/utils/generateLocalizedSlug";

const languageSchema = z.enum(supportedLanguages);

export const translationInputSchema = z.object({
  language: languageSchema,
  title: z.string().trim().optional().default(""),
  slug: z.string().trim().optional().default(""),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
});

export type TranslationInput = z.input<typeof translationInputSchema>;

export type NormalizedTranslation = {
  language: LanguageCode;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

const myMemoryResponseSchema = z.object({
  responseData: z.object({
    translatedText: z.string(),
  }),
});

const libreTranslateResponseSchema = z.object({
  translatedText: z.string(),
});

async function translateText(text: string | null | undefined, targetLanguage: LanguageCode) {
  const source = text?.trim() ?? "";
  if (!source || targetLanguage === defaultLanguage) return source;

  try {
    const endpoint = process.env.TRANSLATION_API_URL;
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: source,
          source: defaultLanguage,
          target: targetLanguage,
          format: "text",
        }),
      });
      const payload: unknown = await response.json();
      const parsed = libreTranslateResponseSchema.safeParse(payload);
      if (response.ok && parsed.success) return parsed.data.translatedText.trim() || source;
    }

    const params = new URLSearchParams({
      q: source,
      langpair: `${defaultLanguage}|${targetLanguage}`,
    });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
      cache: "no-store",
    });
    const payload: unknown = await response.json();
    const parsed = myMemoryResponseSchema.safeParse(payload);
    if (response.ok && parsed.success) {
      return parsed.data.responseData.translatedText.trim() || source;
    }
  } catch (error: unknown) {
    console.error(
      error instanceof Error ? error.message : "Unknown translation error"
    );
  }

  return source;
}

export async function buildAutoTranslationPayload(
  fallback: {
    title: string;
    slug?: string;
    shortDescription?: string | null;
    description?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  },
  options: { includeShortDescription?: boolean } = {}
): Promise<NormalizedTranslation[]> {
  const translations = await Promise.all(
    supportedLanguages.map(async (language) => {
      const title =
        language === defaultLanguage
          ? fallback.title.trim()
          : await translateText(fallback.title, language);
      const description =
        language === defaultLanguage
          ? emptyToNull(fallback.description)
          : emptyToNull(await translateText(fallback.description, language));
      const shortDescription = options.includeShortDescription
        ? language === defaultLanguage
          ? emptyToNull(fallback.shortDescription)
          : emptyToNull(await translateText(fallback.shortDescription, language))
        : undefined;
      const metaTitle =
        language === defaultLanguage
          ? emptyToNull(fallback.metaTitle)
          : emptyToNull(await translateText(fallback.metaTitle ?? fallback.title, language));
      const metaDescription =
        language === defaultLanguage
          ? emptyToNull(fallback.metaDescription)
          : emptyToNull(await translateText(fallback.metaDescription ?? fallback.description, language));

      return {
        language,
        title,
        slug:
          language === defaultLanguage && fallback.slug
            ? cleanSlug(fallback.slug)
            : cleanSlug(generateLocalizedSlug(title, language)),
        shortDescription,
        description,
        metaTitle,
        metaDescription,
      };
    })
  );

  return translations;
}

export function buildEnglishTranslationPayload(
  fallback: {
    title: string;
    slug?: string;
    shortDescription?: string | null;
    description?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  },
  options: { includeShortDescription?: boolean } = {}
): NormalizedTranslation {
  const cleanDescription = (fallback.description || "").replace(/<[^>]*>?/gm, "").trim();
  const autoMetaTitle = emptyToNull(fallback.metaTitle) || fallback.title.trim();
  const autoMetaDescription =
    emptyToNull(fallback.metaDescription) || cleanDescription.slice(0, 160) || fallback.title.trim();

  return {
    language: defaultLanguage,
    title: fallback.title.trim(),
    slug: cleanSlug(fallback.slug || generateLocalizedSlug(fallback.title, defaultLanguage)),
    shortDescription: options.includeShortDescription ? emptyToNull(fallback.shortDescription) : undefined,
    description: emptyToNull(fallback.description),
    metaTitle: autoMetaTitle,
    metaDescription: autoMetaDescription,
  };
}

function emptyToNull(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized ? normalized : null;
}

export function normalizeTranslationPayload(
  input: unknown,
  fallback: { title: string; slug?: string; description?: string | null },
  options: { requireEnglish?: boolean; includeShortDescription?: boolean } = {}
) {
  const requireEnglish = options.requireEnglish ?? true;
  const parsed = z.array(translationInputSchema).safeParse(input ?? []);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid translation payload." };
  }

  const byLanguage = new Map<LanguageCode, NormalizedTranslation>();

  for (const item of parsed.data) {
    const title = item.title.trim();
    const slug = cleanSlug(item.slug || generateLocalizedSlug(title, item.language));
    const hasContent =
      title ||
      slug ||
      item.shortDescription ||
      item.description ||
      item.metaTitle ||
      item.metaDescription;

    if (!hasContent) continue;
    if (!title) {
      return { success: false as const, message: `${item.language} translation title is required when translation is filled.` };
    }
    if (!slug) {
      return { success: false as const, message: `${item.language} translation slug is required.` };
    }
    if (byLanguage.has(item.language)) {
      return { success: false as const, message: `Duplicate ${item.language} translation is not allowed.` };
    }

    byLanguage.set(item.language, {
      language: item.language,
      title,
      slug,
      shortDescription: options.includeShortDescription ? emptyToNull(item.shortDescription) : undefined,
      description: emptyToNull(item.description),
      metaTitle: emptyToNull(item.metaTitle),
      metaDescription: emptyToNull(item.metaDescription),
    });
  }

  if (!byLanguage.has(defaultLanguage)) {
    const englishSlug = cleanSlug(fallback.slug || generateLocalizedSlug(fallback.title, defaultLanguage));
    if (requireEnglish && (!fallback.title?.trim() || !englishSlug)) {
      return { success: false as const, message: "English title and slug are required." };
    }
    if (fallback.title?.trim() && englishSlug) {
      byLanguage.set(defaultLanguage, {
        language: defaultLanguage,
        title: fallback.title.trim(),
        slug: englishSlug,
        shortDescription: undefined,
        description: emptyToNull(fallback.description),
        metaTitle: null,
        metaDescription: null,
      });
    }
  }

  return { success: true as const, translations: Array.from(byLanguage.values()) };
}

export function toTranslationFormDefaults(updateData?: {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  translations?: TranslationInput[] | null;
}) {
  return supportedLanguages.map((language) => {
    const existing = updateData?.translations?.find((item) => item.language === language);
    return {
      language,
      title: existing?.title ?? (language === defaultLanguage ? updateData?.title ?? "" : ""),
      slug: existing?.slug ?? (language === defaultLanguage ? updateData?.slug ?? "" : ""),
      shortDescription: existing?.shortDescription ?? "",
      description: existing?.description ?? (language === defaultLanguage ? updateData?.description ?? "" : ""),
      metaTitle: existing?.metaTitle ?? "",
      metaDescription: existing?.metaDescription ?? "",
    };
  });
}

export function prismaUniqueMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  ) {
    return "A translation with this language and slug already exists.";
  }

  return fallback;
}
