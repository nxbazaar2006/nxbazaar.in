import type { LanguageCode, ProductAiAction } from "./product-description-schema";

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
};

export const STRICT_TRANSLATION_RULES = [
  "1. DO NOT change any factual details, technical specifications, prices, warranties, or quantities.",
  "2. DO NOT translate technical identifiers, brand names, SKU codes, model numbers, barcodes, dimensions, or unit measurements (e.g. kg, ml, cm). Keep them as-is.",
  "3. Preserve all TipTap HTML/formatting tags (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <table>, <tr>, <th>, <td>, <blockquote>, etc.).",
  "4. Use natural, high-converting ecommerce language appropriate for the target culture/locale.",
  "5. Hindi and Marathi content must be grammatically flawless, highly readable, and professional.",
  "6. Output ONLY the resulting HTML content without markdown code blocks, explanations, or commentary.",
];

export function getActionInstruction(
  action: ProductAiAction,
  sourceLang: LanguageCode = "en",
  targetLang?: LanguageCode
): string {
  const targetLanguageName = LANGUAGE_NAMES[targetLang || sourceLang] || "English";

  switch (action) {
    case "generate":
      return `Generate a compelling, SEO-friendly ecommerce product description in ${targetLanguageName}. Organize with H2/H3 headings, sub-paragraphs, bullet points of top benefits, and a call-to-action.`;

    case "translate":
    case "translate-full":
      return `Translate the provided product content accurately into ${targetLanguageName}. Follow all strict translation and formatting preservation rules.`;

    case "translate-en-hi":
      return "Translate the English product content into fluent, natural Hindi. Preserve technical terms, specs, and HTML tags.";

    case "translate-en-mr":
      return "Translate the English product content into fluent, natural Marathi. Preserve technical terms, specs, and HTML tags.";

    case "improve":
      return `Improve the tone, clarity, and persuasive power of the content in ${targetLanguageName} without altering any facts or specifications.`;

    case "grammar":
      return `Fix spelling, grammar, punctuation, and phrasing in ${targetLanguageName} while preserving exact meaning and HTML structure.`;

    case "professional":
      return `Rewrite the text in a polished, premium, professional ecommerce brand voice in ${targetLanguageName}.`;

    case "shorten":
      return `Make the description concise, punchy, and easy to skim in ${targetLanguageName} without removing key features.`;

    case "expand":
      return `Elaborate on product benefits, usage scenarios, and value propositions in ${targetLanguageName} based strictly on supplied context.`;

    case "features":
      return `Extract 4 to 8 key product features as bullet points in ${targetLanguageName} formatted as a <ul> list.`;

    case "faq":
      return `Generate 3 to 5 relevant Product FAQs with questions in <h3> or <strong> and answers in <p> in ${targetLanguageName}.`;

    case "seo":
      return `Optimize the description for search engines in ${targetLanguageName} by incorporating rich buyer intent keywords and natural sub-headings.`;

    case "meta-title":
      return `Generate a click-worthy SEO Meta Title under 60 characters in ${targetLanguageName}. Output plain text only.`;

    case "meta-description":
      return `Generate a high-converting SEO Meta Description between 140-160 characters in ${targetLanguageName}. Output plain text only.`;

    case "keywords":
      return `Extract 5 to 10 relevant SEO keywords in ${targetLanguageName} as a comma-separated list.`;

    default:
      return `Enhance the product content in ${targetLanguageName}.`;
  }
}
