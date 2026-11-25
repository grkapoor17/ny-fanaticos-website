/**
 * Match data model. Match data lives in Supabase (tables `matches` and
 * `match_players`) and is loaded by src/lib/clubData.ts.
 *
 * `lineup` and `scorers` keep the name recorded on matchday, so guests and
 * one-off call-ups stay in match history. Squad members are additionally
 * identified by player id (`squadPlayerIds`, `Scorer.playerId`), which is
 * what player stats are computed from. Assists aren't tracked.
 */

export type MatchStatus = "scheduled" | "final";

export type Scorer = {
  name: string;
  /** Squad player id, or null for a guest. */
  playerId: string | null;
  goals: number;
};

export type Match = {
  id: string;
  competition: string;
  stage: string;
  season: string;
  date: string | null; // ISO date, or null when TBD
  time: string | null;
  venue: string | null;
  opponent: string;
  homeAway: "home" | "away" | "neutral" | null;
  nyFanaticosScore: number | null;
  opponentScore: number | null;
  penaltiesFor: number | null;
  penaltiesAgainst: number | null;
  status: MatchStatus;
  /** Result awarded without playing (walkover, bye). */
  forfeit: boolean;
  note?: string;
  /** Everyone who played, by name as recorded on matchday, in lineup order. */
  lineup: string[];
  /** Ids of squad players who played (guests excluded). */
  squadPlayerIds: string[];
  /** Only players with at least one goal. */
  scorers: Scorer[];
};

export function byDateDesc(a: Match, b: Match): number {
  if (!a.date || !b.date) return 0;
  return a.date < b.date ? 1 : -1;
}
