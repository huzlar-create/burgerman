// Slår en dansk adresse op og finder koordinater via OpenStreetMap (Nominatim)
export type GeocodeResult = { lat: number; lng: number; city: string | null };

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "dk");
  url.searchParams.set("addressdetails", "1");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Burgerman.dk (https://burgerman.dk)", "Accept-Language": "da" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const [hit] = (await res.json()) as Array<{
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }>;
    if (!hit) return null;
    const a = hit.address ?? {};
    return {
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      city: a.city ?? a.town ?? a.village ?? a.municipality ?? null,
    };
  } catch {
    return null;
  }
}
