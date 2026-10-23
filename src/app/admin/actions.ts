"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// Godkend eller afvis en anmeldelse fra køen
export async function setReviewStatus(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = formData.get("status") === "approved" ? "approved" : "rejected";

  await supabase
    .from("reviews")
    .update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      approved_by: status === "approved" ? user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/", "layout");
}

export async function deleteReview(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("reviews").delete().eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
}
