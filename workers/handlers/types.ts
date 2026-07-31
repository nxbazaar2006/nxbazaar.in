import type { LanguageCode } from "@/lib/i18n/languages";
import type { TranslatedFields } from "@/lib/translations/translation-service";
import type { TranslationEntityType } from "@/lib/queues/translation-job-types";

export type SourceTranslationData = {
  fields: TranslatedFields;
  sourceHash: string;
};

export type TargetTranslationState = {
  sourceHash: string | null;
  isAutoTranslated: boolean;
  isManuallyEdited: boolean;
};

export interface EntityTranslationHandler {
  getSource(entityId: string): Promise<SourceTranslationData | null>;
  getExistingTarget(entityId: string, language: LanguageCode): Promise<TargetTranslationState | null>;
  saveTranslation(
    entityId: string,
    language: LanguageCode,
    translatedFields: TranslatedFields,
    sourceHash: string
  ): Promise<void>;
}

export type EntityTranslationHandlerRegistry = Partial<Record<TranslationEntityType, EntityTranslationHandler>>;
