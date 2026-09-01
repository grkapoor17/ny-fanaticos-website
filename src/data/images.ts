/**
 * Centralized image config.
 *
 * V1 ships with no real club photography, so every entry points at a
 * labeled placeholder instead of a broken <img src>. Swap `src` for a real
 * file under /public once assets exist — nothing else needs to change.
 */

export type ImageAsset = {
  /** Path under /public once a real asset exists. Null = still a placeholder. */
  src: string | null;
  /** Shown on the placeholder block so it's obvious what to shoot/upload. */
  label: string;
  alt: string;
};

export const images = {
  heroHome: {
    src: null,
    label: "PLACEHOLDER — hero match/action photo",
    alt: "NY Fanaticos players in action",
  },
  champions: {
    src: null,
    label: "PLACEHOLDER — trophy lift / team celebration photo",
    alt: "NY Fanaticos celebrating the GroupStage NYC championship",
  },
  clubIntro: {
    src: null,
    label: "PLACEHOLDER — team photo or NYC pitch photo",
    alt: "NY Fanaticos team photo",
  },
  clubCity: {
    src: null,
    label: "PLACEHOLDER — night match / NYC field photo",
    alt: "Night match on an NYC field",
  },
  clubHero: {
    src: null,
    label: "PLACEHOLDER — editorial team portrait",
    alt: "NY Fanaticos team portrait",
  },
  matchesHero: {
    src: null,
    label: "PLACEHOLDER — match action photo",
    alt: "Match action",
  },
  squadHero: {
    src: null,
    label: "PLACEHOLDER — full squad photo",
    alt: "NY Fanaticos full squad",
  },
  joinHero: {
    src: null,
    label: "PLACEHOLDER — training / open trial photo",
    alt: "NY Fanaticos training session",
  },
  sponsorsHero: {
    src: null,
    label: "PLACEHOLDER — matchday / sponsor activation photo",
    alt: "Matchday at Lydia's NYC",
  },
  lydiasLogo: {
    src: null,
    label: "LOGO PLACEHOLDER — Lydia's NYC",
    alt: "Lydia's NYC logo",
  },
  instagramGrid: [
    { src: null, label: "IG PLACEHOLDER 1", alt: "NY Fanaticos Instagram post" },
    { src: null, label: "IG PLACEHOLDER 2", alt: "NY Fanaticos Instagram post" },
    { src: null, label: "IG PLACEHOLDER 3", alt: "NY Fanaticos Instagram post" },
    { src: null, label: "IG PLACEHOLDER 4", alt: "NY Fanaticos Instagram post" },
    { src: null, label: "IG PLACEHOLDER 5", alt: "NY Fanaticos Instagram post" },
    { src: null, label: "IG PLACEHOLDER 6", alt: "NY Fanaticos Instagram post" },
  ] satisfies ImageAsset[],
  crest: {
    src: null,
    label: "CREST PLACEHOLDER",
    alt: "NY Fanaticos crest",
  },
} satisfies Record<string, ImageAsset | ImageAsset[]>;

export function playerImage(playerId: string): ImageAsset {
  return {
    src: null,
    label: `PLAYER PHOTO PLACEHOLDER — ${playerId}`,
    alt: `Portrait of ${playerId}`,
  };
}
