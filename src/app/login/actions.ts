"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { sent?: boolean; error?: string };

// Sender et login-link til mailen. Ingen adgangskoder at huske.
export async function sendLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Det ligner ikke en mailadresse." };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/admin` },
  });

  if (error) return { error: "Mailen kunne ikke sendes. Prøv igen om lidt." };
  return { sent: true };
}
