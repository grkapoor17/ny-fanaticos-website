import fs from "node:fs";
import path from "node:path";

/**
 * Centralized image config.
 *
 * Drop a real file into /public matching the naming convention below and
 * it's picked up automatically on the next build/dev reload — no code
 * changes needed. Until a file exists, a labeled placeholder renders
 * instead of a broken <img>.
 *
 * Conventions:
 *   - Section photos: /public/images/<key>.(jpg|jpeg|png|webp)
 *       e.g. /public/images/hero.jpg for the homepage hero
 *   - Instagram grid: /public/images/instagram-1.jpg ... instagram-6.jpg
 *   - Player photos: /public/players/<player-id>.(jpg|jpeg|png|webp)
 *       <player-id> matches the `id` field in src/data/players.ts,
 *       e.g. /public/players/gautam.jpg
 *
 * This is server-only (uses fs) — only import images.ts from server
 * components (no "use client" files).
 */

export type ImageAsset = {
  src: string | null;
  label: string;
  alt: string;
};

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function resolve(relativeDir: string, basename: string): string | null {
  for (const ext of EXTENSIONS) {
    const filename = `${basename}.${ext}`;
    const diskPath = path.join(process.cwd(), "public", relativeDir, filename);
    if (fs.existsSync(diskPath)) {
      return `/${relativeDir}/${filename}`;
    }
  }
  return null;
}

function sectionImage(key: string, label: string, alt: string): ImageAsset {
  return { src: resolve("images", key), label, alt };
}

export const images = {
  heroHome: sectionImage("hero", "PLACEHOLDER — hero match/action photo", "NY Fanaticos players in action"),
  champions: sectionImage("champions", "PLACEHOLDER — trophy lift / team celebration photo", "NY Fanaticos celebrating the GroupStage D1 championship"),
  clubIntro: sectionImage("club-intro", "PLACEHOLDER — team photo or NYC pitch photo", "NY Fanaticos team photo"),
  clubCity: sectionImage("club-city", "PLACEHOLDER — night match / NYC field photo", "Night match on an NYC field"),
  clubHero: sectionImage("club-hero", "PLACEHOLDER — editorial team portrait", "NY Fanaticos team portrait"),
  matchesHero: sectionImage("matches-hero", "PLACEHOLDER — match action photo", "Match action"),
  squadHero: sectionImage("squad-hero", "PLACEHOLDER — full squad photo", "NY Fanaticos full squad"),
  joinHero: sectionImage("join-hero", "PLACEHOLDER — training / open trial photo", "NY Fanaticos training session"),
  sponsorsHero: sectionImage("sponsors-hero", "PLACEHOLDER — matchday / sponsor activation photo", "Matchday at Lydia's NYC"),
  lydiasLogo: sectionImage("lydias-logo", "LOGO PLACEHOLDER — Lydia's NYC", "Lydia's NYC logo"),
  instagramGrid: [1, 2, 3, 4, 5, 6].map((n) =>
    sectionImage(`instagram-${n}`, `IG PLACEHOLDER ${n}`, "NY Fanaticos Instagram post")
  ),
  crest: sectionImage("crest", "CREST PLACEHOLDER", "NY Fanaticos crest"),
} satisfies Record<string, ImageAsset | ImageAsset[]>;

export function playerImage(playerId: string): ImageAsset {
  return {
    src: resolve("players", playerId),
    label: `PLAYER PHOTO PLACEHOLDER — ${playerId}`,
    alt: `Portrait of ${playerId}`,
  };
}

/** Same convention as playerImage, for non-playing staff: /public/staff/<staff-id>.(jpg|jpeg|png|webp) */
export function staffImage(staffId: string): ImageAsset {
  return {
    src: resolve("staff", staffId),
    label: `STAFF PHOTO PLACEHOLDER — ${staffId}`,
    alt: `Portrait of ${staffId}`,
  };
}
