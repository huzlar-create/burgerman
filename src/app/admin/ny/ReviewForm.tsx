"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createReview, type ReviewFormState } from "./actions";

type Restaurant = { id: string; name: string; city: string };
type Photo = { path: string; preview: string };

const input = "rounded-kort border-2 border-streg bg-kort px-3 py-2 font-normal";
const label = "grid gap-1 font-semibold";

const subScores = [
  { name: "score_patty", label: "Bøf" },
  { name: "score_bun", label: "Bolle" },
  { name: "score_sides", label: "Tilbehør" },
  { name: "score_price", label: "Pris" },
];

// Gør store mobilbilleder mindre, før de lægges op (max 2000 px, JPEG)
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

export function ReviewForm({ restaurants, userId }: { restaurants: Restaurant[]; userId: string }) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(createReview, {});
  const [restaurantId, setRestaurantId] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const batch = crypto.randomUUID();
    for (const [i, file] of Array.from(files).entries()) {
      const blob = await shrink(file);
      const path = `${userId}/${batch}/${i}.jpg`;
      const { error } = await supabase.storage
        .from("review-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) {
        setUploadError("Et billede kunne ikke lægges op. Prøv igen.");
        continue;
      }
      setPhotos((p) => [...p, { path, preview: URL.createObjectURL(blob) }]);
    }
    setUploading(false);
  }

  return (
    <form action={action} className="mt-6 grid gap-6">
      <fieldset className="grid gap-3 rounded-kort border-2 border-streg bg-kort p-4">
        <legend className="px-2 font-display">STEDET</legend>
        <label className={label}>
          Restaurant
          <select
            name="restaurant_id"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className={input}
          >
            <option value="">+ Nyt sted</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city})
              </option>
            ))}
          </select>
        </label>
        {restaurantId === "" && (
          <>
            <label className={label}>
              Navn
              <input name="name" required className={input} placeholder="Fx Bøfhuset" />
            </label>
            <label className={label}>
              Adresse
              <input name="address" required className={input} placeholder="Fx Jægergårdsgade 57, 8000 Aarhus C" />
              <span className="text-sm font-normal opacity-80">Vi finder selv stedet på kortet ud fra adressen.</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>
                By eller bydel (valgfri)
                <input name="city" className={input} placeholder="Fx Aarhus C" />
              </label>
              <label className={label}>
                Hjemmeside (valgfri)
                <input name="website" type="url" className={input} placeholder="https://" />
              </label>
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="grid gap-3 rounded-kort border-2 border-streg bg-kort p-4">
        <legend className="px-2 font-display">BURGEREN</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={`${label} sm:col-span-2`}>
            Burgerens navn (valgfri)
            <input name="burger_name" className={input} placeholder="Fx Classic Cheese" />
          </label>
          <label className={label}>
            Pris i kr.
            <input name="price_kr" type="number" min="0" inputMode="numeric" className={input} />
          </label>
        </div>
        <label className={label}>
          Samlet karakter (0-10)
          <input name="score_overall" required inputMode="decimal" className={`${input} tal text-2xl`} placeholder="8,5" />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subScores.map((s) => (
            <label key={s.name} className={label}>
              {s.label}
              <input name={s.name} inputMode="decimal" className={`${input} tal`} placeholder="–" />
            </label>
          ))}
        </div>
        <label className={label}>
          Anmeldelsen
          <textarea name="body" rows={6} className={input} placeholder="Hvordan var den? Ærligt." />
        </label>
        <label className={label}>
          Besøgt den
          <input name="visited_on" type="date" className={input} />
        </label>
      </fieldset>

      <fieldset className="grid gap-3 rounded-kort border-2 border-streg bg-kort p-4">
        <legend className="px-2 font-display">BILLEDER</legend>
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
        {uploading && <p>Lægger billeder op…</p>}
        {uploadError && <p className="font-semibold text-ketchup">{uploadError}</p>}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {photos.map((p) => (
              <div key={p.path}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" className="size-24 rounded-kort border-2 border-streg object-cover" />
                <input type="hidden" name="photo_path" value={p.path} />
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {state.error && <p className="font-semibold text-ketchup">{state.error}</p>}
      <button
        disabled={pending || uploading}
        className="justify-self-start rounded-full border-2 border-ristet bg-ketchup px-6 py-3 font-display text-bolle disabled:opacity-60"
      >
        {pending ? "GEMMER…" : "UDGIV ANMELDELSE"}
      </button>
    </form>
  );
}
