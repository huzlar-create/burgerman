import { BurgerMapLazy } from "@/components/BurgerMapLazy";
import type { MapPin } from "@/components/BurgerMap";
import { createPublicClient } from "@/lib/supabase/public";
import { formatPrice, formatScore } from "@/lib/format";
import { site } from "@/lib/site";

// Bygges statisk og opdateres højst hvert 5. minut
export const revalidate = 300;

export default async function Home() {
  const supabase = createPublicClient();
  const { data: stats } = await supabase
    .from("restaurant_stats")
    .select("slug, name, city, lat, lng, avg_overall, review_count, typical_price_kr")
    .order("avg_overall", { ascending: false });

  const all = stats ?? [];
  const top = all.slice(0, 3);
  const pins: MapPin[] = all
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({
      slug: r.slug!,
      name: r.name!,
      city: r.city!,
      lat: r.lat!,
      lng: r.lng!,
      score: r.avg_overall,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Burgerman.dk",
    url: site.url,
    inLanguage: "da-DK",
    description: site.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="striber border-b-2 border-streg">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="font-display text-4xl leading-tight text-ketchup sm:text-5xl">
            DANMARKS BEDSTE BURGERE
          </h1>
          <p className="mt-3 max-w-xl text-lg">
            Ærlige anmeldelser, et kort over alle stederne og toplister, der siger det, som det er.
            Tag servietter med.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-streg" aria-label="Kort over anmeldte burgersteder">
        <BurgerMapLazy pins={pins} />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="font-display text-2xl">TOP 3 LIGE NU</h2>
        {top.length > 0 ? (
          <ol className="mt-4 grid gap-3">
            {top.map((r, i) => (
              <li
                key={r.slug}
                className="flex items-center gap-4 rounded-kort border-2 border-streg bg-kort px-4 py-3"
              >
                <span className="tal text-3xl text-ketchup">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-extrabold">{r.name}</p>
                  <p className="text-sm opacity-80">
                    {[r.city, r.typical_price_kr != null ? formatPrice(r.typical_price_kr) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="tal text-2xl">{formatScore(r.avg_overall)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-kort border-2 border-streg bg-kort px-4 py-6">
            Grillen er ved at blive varm. De første anmeldelser kommer snart.
          </p>
        )}
      </section>
    </>
  );
}
