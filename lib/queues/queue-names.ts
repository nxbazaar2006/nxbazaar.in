import { getAppEnv } from "@/lib/env";

export const QUEUE_NAMES = {
  TRANSLATIONS: getAppEnv().TRANSLATION_QUEUE_NAME,
} as const;
