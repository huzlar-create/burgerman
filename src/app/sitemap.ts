import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Udvides i trin 3 med en side pr. restaurant og by
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "daily", priority: 1 }];
}
