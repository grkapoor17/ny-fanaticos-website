/**
 * Match data model. Designed to support multiple competitions/seasons so
 * this can move to a database later without changing the shape consumers
 * rely on.
 *
 * Real opponent names, exact dates, and full scorelines for early results
 * have not been supplied — those fields are left as explicit placeholders
 * rather than invented. Replace them as real fixture data comes in.
 */

export type MatchStatus = "scheduled" | "final";

export type Match = {
  id: string;
  competition: string;
  stage: string;
  season: string;
  date: string | null; // ISO date, or null when TBD
  time: string | null;
  venue: string | null;
  opponent: string; // literal "Opponent TBD" until confirmed
  homeAway: "home" | "away" | "neutral" | null;
  nyFanaticosScore: number | null;
  opponentScore: number | null;
  penaltiesFor: number | null;
  penaltiesAgainst: number | null;
  status: MatchStatus;
  note?: string;
};

export const results: Match[] = [
  {
    id: "groupstage-2026-qf",
    competition: "GroupStage NYC",
    stage: "Quarterfinal",
    season: "2026",
    date: null,
    time: null,
    venue: null,
    opponent: "Opponent TBD",
    homeAway: null,
    nyFanaticosScore: 5,
    opponentScore: 0,
    penaltiesFor: null,
    penaltiesAgainst: null,
    status: "final",
  },
  {
    id: "groupstage-2026-sf",
    competition: "GroupStage NYC",
    stage: "Semifinal",
    season: "2026",
    date: null,
    time: null,
    venue: null,
    opponent: "Opponent TBD",
    homeAway: null,
    nyFanaticosScore: null,
    opponentScore: null,
    penaltiesFor: null,
    penaltiesAgainst: null,
    status: "final",
    note: "NY Fanaticos advanced on penalties.",
  },
  {
    id: "groupstage-2026-final",
    competition: "GroupStage NYC",
    stage: "Final",
    season: "2026",
    date: null,
    time: null,
    venue: null,
    opponent: "Opponent TBD",
    homeAway: null,
    nyFanaticosScore: null,
    opponentScore: null,
    penaltiesFor: null,
    penaltiesAgainst: null,
    status: "final",
    note: "NY Fanaticos won the final to be crowned GroupStage NYC Champions.",
  },
];

/**
 * No confirmed upcoming fixtures yet. Add entries here with status:
 * "scheduled" as the schedule is confirmed — the Matches page renders an
 * empty state until then.
 */
export const fixtures: Match[] = [];

export const latestResult = results[results.length - 1] ?? null;
export const nextMatch = fixtures[0] ?? null;
