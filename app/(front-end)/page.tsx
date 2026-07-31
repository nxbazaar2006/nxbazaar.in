import CategoryList from "@/components/frontend/CategoryList";
import CommunityTrainings from "@/components/frontend/CommunityTrainings";
import Hero from "@/components/frontend/Hero";
import MarketList from "@/components/frontend/MarketList";
import { GlassText } from "@/components/ui/glass-text";
import { getData } from "@/lib/getData";
import { getVlogs } from "@/lib/services/vlog-service";
import { MoveRight, Play, Video } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const categoriesData = await getData("categories");
  const categories = Array.isArray(categoriesData)
    ? categoriesData.filter((category) => {
        return category.products && category.products.length > 3;
      })
    : [];

  const trainingsData = await getData("trainings");
  const trainings = Array.isArray(trainingsData) ? trainingsData : [];

  const { vlogs } = await getVlogs({ status: "PUBLISHED", limit: 3 });

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-12">
      {/* Hero Banner & Search Section */}
      <Hero />

      {/* Markets List */}
      <MarketList />

      {/* Product Categories */}
      {categories.map((category, i) => {
        return (
          <section key={category.id || i} className="w-full">
            <CategoryList isMarketPage={false} category={category} />
          </section>
        );
      })}

      {/* Featured Blogs Section */}
      <section className="w-full">
        <CommunityTrainings title="Featured Blogs & Guides" trainings={(trainings as any[]).slice(0, 3)} />
      </section>

      {/* Featured Videos & Vlogs Section */}
      {vlogs.length > 0 && (
        <section className="w-full rounded-[28px] border border-white/25 bg-white/15 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-white/25">
              <GlassText
                variant="light"
                title="Featured Video Tutorials & Demos"
                description="Watch product demonstrations, unboxing, and agricultural guides."
                headingAs="h2"
                headingClassName="text-2xl sm:text-3xl font-bold text-slate-900"
                className="w-full"
              />
              <Link
                href="/vlogs"
                className="inline-flex items-center justify-center shrink-0 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Watch All Videos <MoveRight className="ml-2 h-4 w-4 shrink-0" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vlogs.map((vlog) => (
                <div
                  key={vlog.id}
                  className="liquid-card w-full h-full rounded-[24px] border border-white/25 bg-white/15 backdrop-blur-2xl p-4 sm:p-5 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-[3px] hover:border-white/40 hover:bg-white/20 group relative flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative aspect-w-16 aspect-h-9 h-44 w-full overflow-hidden rounded-[18px] bg-slate-900">
                    {vlog.thumbnailUrl ? (
                      <img
                        src={vlog.thumbnailUrl}
                        alt={vlog.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105 opacity-80"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
                        <Video className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Link
                        href={`/vlogs/${vlog.slug}`}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl transition transform group-hover:scale-110"
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-relaxed group-hover:text-rose-600 transition">
                      <Link href={`/vlogs/${vlog.slug}`}>{vlog.title}</Link>
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{vlog.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
