import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatScore } from "@/lib/format";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteReview, setReviewStatus } from "./actions";

const statusLabel = { pending: "Afventer", approved: "Godkendt", rejected: "Afvist" } as const;
const statusClass = {
  pending: "bg-sennep text-ristet",
  approved: "bg-agurk text-white",
  rejected: "bg-ristet/20",
} as const;

export default async function AdminHome() {
  const { supabase } = await requireAdmin();

  const [{ data: reviews }, { count: restaurantCount }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, status, score_overall, burger_name, created_at, restaurants(name, city, slug), profiles!reviews_author_id_fkey(display_name)")
      .order("status", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("restaurants").select("id", { count: "exact", head: true }),
  ]);

  const list = reviews ?? [];
  const pending = list.filter((r) => r.status === "pending").length;
  const approved = list.filter((r) => r.status === "approved").length;

  const tiles = [
    { label: "Venter på dig", value: pending, accent: pending > 0 },
    { label: "Godkendte anmeldelser", value: approved },
    { label: "Steder på kortet", value: restaurantCount ?? 0 },
  ];

  return (
    <>
      <h1 className="font-display text-3xl text-ketchup">DASHBOARD</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-kort border-2 border-streg px-4 py-3 ${t.accent ? "bg-sennep text-ristet" : "bg-kort"}`}
          >
            <p className="tal text-3xl">{t.value}</p>
            <p className="text-sm font-semibold">{t.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl">ANMELDELSER</h2>
      {list.length === 0 ? (
        <p className="mt-3 rounded-kort border-2 border-streg bg-kort px-4 py-6">
          Ingen anmeldelser endnu.{" "}
          <Link href="/admin/ny" className="font-semibold text-ketchup underline">
            Skriv den første
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {list.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-kort border-2 border-streg bg-kort px-4 py-3"
            >
              <span className="tal w-14 text-2xl">{formatScore(r.score_overall)}</span>
              <div className="min-w-40 flex-1">
                <p className="font-extrabold">{r.restaurants?.name}</p>
                <p className="text-sm opacity-80">
                  {[r.burger_name, r.restaurants?.city, r.profiles?.display_name].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${statusClass[r.status]}`}>
                {statusLabel[r.status]}
              </span>
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <form action={setReviewStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-full border-[1.5px] border-ristet bg-agurk px-3 py-1 text-sm font-semibold text-white">
                      Godkend
                    </button>
                  </form>
                )}
                {r.status === "pending" && (
                  <form action={setReviewStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-full border-[1.5px] border-streg px-3 py-1 text-sm">Afvis</button>
                  </form>
                )}
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton message="Slet anmeldelsen for altid?" className="rounded-full border-[1.5px] border-streg px-3 py-1 text-sm">
                    Slet
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
