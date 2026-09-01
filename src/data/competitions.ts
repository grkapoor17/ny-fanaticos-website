export type Competition = {
  id: string;
  name: string;
  season: string;
  status: string;
  summary: string;
};

export const competitions: Competition[] = [
  {
    id: "mwchampionship-2026-fall",
    name: "MWChampionship",
    season: "2026 Fall",
    status: "Upcoming",
    summary: "NY Fanaticos will compete in MWChampionship this fall. Fixtures to be confirmed.",
  },
  {
    id: "bowery-premier-d4-2026-fall",
    name: "Bowery Premier League D4",
    season: "2026 Fall",
    status: "Upcoming",
    summary: "NY Fanaticos return to Bowery Premier League D4 this fall. Fixtures to be confirmed.",
  },
  {
    id: "bowery-premier-d4-2026-summer",
    name: "Bowery Premier League D4",
    season: "2026 Summer",
    status: "Semifinalists",
    summary: "Finished 4th in the regular season before losing in the semifinal.",
  },
  {
    id: "groupstage-d1-2026-summer",
    name: "GroupStage D1",
    season: "2026 Summer",
    status: "Champions",
    summary: "Won the group stage, won the semifinal on penalties, and won the final.",
  },
  {
    id: "groupstage-d1-2026-spring",
    name: "GroupStage D1",
    season: "2026 Spring",
    status: "Semifinalists",
    summary: "Topped the group stage before losing in the semifinal.",
  },
];
