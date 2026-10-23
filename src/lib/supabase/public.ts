import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/lib/database.types";

// Cookie-fri klient til offentlige data. Gør at siderne kan bygges statisk og caches (godt for SEO og fart).
export function createPublicClient() {
  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseKey,
    { auth: { persistSession: false } },
  );
}
