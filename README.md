# Burgerman.dk

Burgeranmeldelser fra hele Danmark på et kort, med automatiske toplister.

## Teknik

- **Next.js** (App Router, TypeScript, Tailwind) – siderne bygges på serveren, så Google kan læse alt.
- **Supabase** – database, login og billedlager. Skemaet ligger i `supabase/migrations`.
- **Vercel** – hosting. Hver ændring på `main` bliver udgivet automatisk.

## Lokal udvikling

```bash
cp .env.example .env.local
npm install
npm run dev
```
