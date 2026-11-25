# NY Fanaticos

Official website for NY Fanaticos, an NYC amateur football club. Built with
Next.js (App Router) + TypeScript + Tailwind CSS. Hosted on Vercel at
[nyfanaticos.com](https://nyfanaticos.com).

## Local dev

```
npm install
npm run dev
```

## Content

Fixtures, results, competitions and the squad (including player photos)
live in **Supabase**: tables `competitions`, `players`, `matches`,
`match_players`, and the `player-photos` storage bucket. Schema changes go
in `supabase/migrations/` and are applied with
`npx supabase db push --db-url "$SUPABASE_DB_URL"`.

`src/lib/clubData.ts` loads everything; reads are cached under the
`club-data` tag (revalidated hourly, and immediately on admin edits).
Player appearances/goals are computed from `match_players`, never stored.

Static content (section images, honours, sponsors, staff) still lives in
`src/data/` and `/public`.

Env vars: see `.env.local.example`. Vercel needs `NEXT_PUBLIC_SUPABASE_URL`
and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Deploy

Deployed automatically by Vercel on every push to `main`.
