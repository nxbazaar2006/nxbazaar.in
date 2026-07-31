import CommunityTrainings from "@/components/frontend/CommunityTrainings";
import { getData } from "@/lib/getData";
import { isSupportedLanguage } from "@/lib/i18n/languages";
import { asArray } from "@/lib/normalizeApiData";
import { notFound } from "next/navigation";
import React from "react";

export default async function LocalizedBlogsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLanguage(lang)) {
    notFound();
  }

  const trainingsData = await getData(`trainings?lang=${lang}`);
  const trainings = asArray(trainingsData);

  return (
    <div className="py-6">
      <CommunityTrainings title="Read All Our Trainings" trainings={trainings} lang={lang} />
    </div>
  );
}
