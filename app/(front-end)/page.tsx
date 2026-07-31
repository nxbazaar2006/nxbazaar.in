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
    <div className="min-h-screen">
      <Hero />
      <MarketList />

      {categories.map((category, i) => {
        return (
          <div className="py-8" key={category.id || i}>
            <CategoryList isMarketPage={false} category={category} />
          </div>
        );
      })}

      {/* Featured Blogs Section */}
      <div className="py-8">
        <CommunityTrainings title="Featured Blogs & Guides" trainings={(trainings as any[]).slice(0, 3)} />
      </div>

      {/* Featured Videos & Vlogs Section */}
      {vlogs.length > 0 && (
        <div className="py-8">
          <section className="liquid-card frontend-glass rounded-[36px] py-12 shadow-lg sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <GlassText
                  variant="light"
                  title="Featured Video Tutorials & Demos"
                  description="Watch product demonstrations, unboxing, and agricultural guides."
                  headingAs="h2"
                  headingClassName="text-3xl sm:text-4xl font-bold"
                  className="max-w-2xl"
                />
                <Link
                  href="/vlogs"
                  className="flex items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-white transition hover:bg-rose-700 shadow-md font-semibold"
                >
                  Watch All Videos <MoveRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
              </div>

              <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-y-12 sm:mt-16 md:max-w-none md:grid-cols-3 md:gap-x-8 lg:gap-x-12">
                {vlogs.map((vlog) => (
                  <div
                    key={vlog.id}
                    className="liquid-card group overflow-hidden rounded-3xl p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-w-16 aspect-h-9 h-44 w-full overflow-hidden rounded-2xl bg-slate-900">
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
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-rose-600 transition">
                        <Link href={`/vlogs/${vlog.slug}`}>{vlog.title}</Link>
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{vlog.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
