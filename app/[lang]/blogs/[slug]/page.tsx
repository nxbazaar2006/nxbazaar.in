import TrainingHtml from "@/components/TrainingHtml";
import CategoryList from "@/components/frontend/CategoryList";
import RecentTrainings from "@/components/frontend/RecentTrainings";
import { convertIsoDateToNormal } from "@/lib/convertIsoDatetoNormal";
import { getData } from "@/lib/getData";
import { isSupportedLanguage } from "@/lib/i18n/languages";
import { asArray } from "@/lib/normalizeApiData";
import { notFound } from "next/navigation";
import React from "react";

export default async function LocalizedBlogDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isSupportedLanguage(lang)) {
    notFound();
  }

  const training = await getData(`trainings/training/${slug}?lang=${lang}`);
  if (!training || !training.id) {
    notFound();
  }

  const trainingId = training.id;
  const normalDate = convertIsoDateToNormal(training.createdAt);
  const allTrainingsData = await getData(`trainings?lang=${lang}`);
  const allTrainings: any[] = asArray(allTrainingsData);
  const recentTrainings = allTrainings.filter(
    (item: any) => item.id !== trainingId
  );
  const category = training.categoryId
    ? await getData(`categories/${training.categoryId}`)
    : null;

  return (
    <>
      <section className="py-12 bg-white sm:py-16 lg:py-20 rounded-md">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-7 lg:gap-x-12">
            <div className="bg-gray-100 lg:col-span-5 rounded-xl">
              <div className="px-4 py-5 sm:p-6 ">
                <div className=" mx-auto">
                  <div className="max-w-3xl mx-auto">
                    <p className="text-base font-medium text-gray-500">
                      {normalDate}
                    </p>
                    <h1 className="mt-6 text-4xl font-bold text-gray-900 ">
                      {training.title}
                    </h1>
                  </div>
                  {training.imageUrl && (
                    <div className="mt-12 sm:mt-16 aspect-w-16 aspect-h-9 lg:aspect-h-6">
                      <img
                        className="object-cover w-full h-full rounded-xl"
                        src={training.imageUrl}
                        alt={training.title}
                      />
                    </div>
                  )}
                  <div className="py-8 text-gray-900 ">
                    <p className="text-lg ">{training.description}</p>
                    <hr className="mt-6" />
                    <div className="py-8">
                      <TrainingHtml content={training.content} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <RecentTrainings recentTrainings={recentTrainings} lang={lang} />
          </div>
        </div>
      </section>
      {category && (
        <div className="py-8">
          <CategoryList isMarketPage={false} category={category} />
        </div>
      )}
    </>
  );
}
