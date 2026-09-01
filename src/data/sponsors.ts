export type Sponsor = {
  id: string;
  name: string;
  tier: "primary" | "partner";
  description: string;
  url: string | null; // fill in once the club has a live link to share
};

export const sponsors: Sponsor[] = [
  {
    id: "lydias-nyc",
    name: "Lydia's NYC",
    tier: "primary",
    description:
      "Lydia's supports NY Fanaticos both on and off the pitch and serves as a home base for the team.",
    url: null,
  },
];

export const primarySponsor = sponsors.find((s) => s.tier === "primary") ?? null;
