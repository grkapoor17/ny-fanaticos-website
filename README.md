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

Club content (fixtures, results, competitions, squad, honours, sponsors)
lives in typed data files under `src/data/`, not hardcoded in components —
this keeps it easy to migrate to a database/CMS later without touching page
markup.

Images are centralized in `src/data/images.ts`. Every entry is currently a
labeled placeholder (`src: null`) since no real club photography exists yet
— swap in real files under `/public` and update the corresponding `src` to
replace them.

The squad roster in `src/data/players.ts` is also placeholder data
(`squadIsPlaceholder = true`) until real player info is provided.

## Deploy

Deployed automatically by Vercel on every push to `main`.
