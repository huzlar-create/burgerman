import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/lib/database.types";

// Supabase-klient til komponenter i browseren
export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
  );
}
