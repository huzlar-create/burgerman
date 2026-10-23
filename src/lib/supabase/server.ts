import { createServerClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

// Supabase-klient til serverkomponenter, server actions og route handlers
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Kaldt fra en serverkomponent; middleware opdaterer sessionen
          }
        },
      },
    },
  );
}
