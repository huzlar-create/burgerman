import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Henter den indloggede bruger og profil. Sender til login, hvis ingen er logget ind.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, is_admin")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile };
}

// Som requireUser, men kun for admin
export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx.profile?.is_admin) redirect("/admin/ingen-adgang");
  return ctx;
}
