export type Competition = {
  id: string;
  name: string;
  season: string;
  status: string;
  summary: string;
};

export const competitions: Competition[] = [
  {
    id: "groupstage-nyc-2026",
    name: "GroupStage NYC",
    season: "2026",
    status: "Champions",
    summary:
      "Finished first in the league-stage group, won the quarterfinal 5–0, advanced through the semifinal on penalties, and won the final.",
  },
  {
    id: "bowery-premier-2026",
    name: "Bowery Premier NYC",
    season: "2026",
    status: "Promotion Campaign",
    summary: "Competing for promotion in Bowery Premier NYC.",
  },
];
