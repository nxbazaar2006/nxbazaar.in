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
    <section className="w-full rounded-[28px] border border-white/25 bg-white/15 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <div className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-white/25">
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
            headingClassName="text-2xl sm:text-3xl text-slate-900 font-bold"
            className="w-full"
          />
          <Link
            href={seeAllLink}
            className="inline-flex items-center justify-center shrink-0 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            {lang === "hi"
              ? "सभी देखें"
              : lang === "mr"
              ? "सर्व पहा"
              : "See All"}
            <MoveRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {trainings.map((training, i) => (
            <BlogCard key={training.id || i} training={training} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
