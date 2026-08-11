"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function HomeLocalizedLabel({ translationKey }: { translationKey: string }) {
  const { t } = useTranslation();
  return <>{t(translationKey)}</>;
}
