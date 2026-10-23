// Supabase-adressen og den offentlige nøgle er ikke hemmelige (de sendes alligevel til browseren).
// Standardværdierne gør, at siden virker på Vercel uden ekstra opsætning.
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mzzwgbjpdcglvagilrun.supabase.co";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_Xto3rKS2VpErzL-4Y46cFQ_Kyw73TrG";
