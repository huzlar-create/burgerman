// Fælles oplysninger om sitet, brugt i metadata, sitemap og strukturerede data
export const site = {
  name: "Burgerman",
  title: "Burgerman.dk – Danmarks bedste burgere på ét kort",
  description:
    "Ærlige burgeranmeldelser fra hele Danmark. Find de bedste burgere på kortet, og se toplisterne for din by.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://burgerman.dk",
  locale: "da_DK",
};
