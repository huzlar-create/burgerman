"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";
import { slugify } from "@/lib/slug";

export type ReviewFormState = { error?: string };

function score(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").replace(",", ".").trim();
  if (raw === "") return null;
  const n = Math.round(Number(raw) * 2) / 2;
  return Number.isFinite(n) && n >= 0 && n <= 10 ? n : null;
}

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

// Gemmer en ny anmeldelse fra dashboardet. Admins anmeldelser bliver godkendt med det samme.
export async function createReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const { supabase, user } = await requireAdmin();

  const overall = score(formData, "score_overall");
  if (overall == null) return { error: "Giv burgeren en samlet karakter fra 0 til 10." };

  let restaurantId = text(formData, "restaurant_id");

  if (!restaurantId) {
    const name = text(formData, "name");
    const address = text(formData, "address");
    if (!name || !address) return { error: "Skriv navn og adresse på stedet." };

    const geo = await geocodeAddress(address);
    const city = text(formData, "city") ?? geo?.city;
    if (!city) return { error: "Vi kunne ikke finde byen ud fra adressen. Skriv den selv." };

    const base = slugify(`${name} ${city}`);
    const { data: taken } = await supabase.from("restaurants").select("slug").like("slug", `${base}%`);
    const used = new Set((taken ?? []).map((r) => r.slug));
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;

    const { data: created, error } = await supabase
      .from("restaurants")
      .insert({
        name,
        address,
        city,
        city_slug: slugify(city),
        slug,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        website: text(formData, "website"),
      })
      .select("id")
      .single();
    if (error || !created) return { error: "Stedet kunne ikke gemmes. Prøv igen." };
    restaurantId = created.id;
  }

  const price = Number(text(formData, "price_kr") ?? NaN);
  const now = new Date().toISOString();

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      restaurant_id: restaurantId,
      author_id: user.id,
      burger_name: text(formData, "burger_name"),
      score_overall: overall,
      score_patty: score(formData, "score_patty"),
      score_bun: score(formData, "score_bun"),
      score_sides: score(formData, "score_sides"),
      score_price: score(formData, "score_price"),
      price_kr: Number.isFinite(price) ? Math.round(price) : null,
      body: text(formData, "body"),
      visited_on: text(formData, "visited_on"),
      status: "approved",
      approved_at: now,
      approved_by: user.id,
    })
    .select("id")
    .single();
  if (error || !review) return { error: "Anmeldelsen kunne ikke gemmes. Prøv igen." };

  // Billederne er allerede lagt op fra browseren; her kobles de på anmeldelsen
  const photos = formData.getAll("photo_path").map(String).filter((p) => p.startsWith(`${user.id}/`));
  if (photos.length > 0) {
    await supabase.from("review_photos").insert(
      photos.map((storage_path, position) => ({ review_id: review.id, storage_path, position })),
    );
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
