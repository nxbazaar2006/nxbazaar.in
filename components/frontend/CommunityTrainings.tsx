import { GlassText } from "@/components/ui/glass-text";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import BlogCard from "./BlogCard";

export default async function CommunityTrainings({
  trainings,
  title,
  lang,
}: {
  trainings: any[];
  title?: string;
  lang?: string;
}) {
  const displayTitle =
    title ||
    (lang === "hi"
      ? "हमारे सभी ब्लॉग और प्रशिक्षण पढ़ें"
      : lang === "mr"
      ? "आमचे सर्व ब्लॉग आणि प्रशिक्षण वाचा"
      : "Read All Our Trainings & Blogs");

  const seeAllLink = lang ? `/${lang}/blogs` : "/blogs";

  return (
    <section className="liquid-card frontend-glass rounded-[36px] py-12 shadow-lg sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <GlassText
            variant="light"
            title={displayTitle}
            description={
              lang === "hi"
                ? "सामुदायिक संसाधनों और प्रशिक्षण से सीखें।"
                : lang === "mr"
                ? "समुदाय संसाधने आणि प्रशिक्षणातून शिका."
                : "Learn from featured community resources and training updates."
            }
            headingAs="h2"
            headingClassName="text-3xl sm:text-4xl"
            className="max-w-2xl"
          />
          <Link
            href={seeAllLink}
            className="flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800"
          >
            {lang === "hi"
              ? "सभी देखें"
              : lang === "mr"
              ? "सर्व पहा"
              : "See All"}
            <MoveRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </div>
        <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-y-12 sm:mt-16 md:max-w-none md:grid-cols-3 md:gap-x-8 lg:gap-x-16">
          {trainings.map((training, i) => (
            <BlogCard key={training.id || i} training={training} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
