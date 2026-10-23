import { requireAdmin } from "@/lib/auth";
import { ReviewForm } from "./ReviewForm";

export default async function NewReviewPage() {
  const { supabase, user } = await requireAdmin();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, city")
    .order("name");

  return (
    <>
      <h1 className="font-display text-3xl text-ketchup">NY ANMELDELSE</h1>
      <ReviewForm restaurants={restaurants ?? []} userId={user.id} />
    </>
  );
}
