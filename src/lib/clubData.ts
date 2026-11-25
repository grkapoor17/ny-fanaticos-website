import { cache } from "react";
import type { Competition } from "@/data/competitions";
import { byDateDesc, type Match, type Scorer } from "@/data/matches";
import { buildPlayers, type Player, type Position, type RosterEntry } from "@/data/players";
import { createPublicClient } from "@/lib/supabase";
import { playerPhotoUrl } from "@/lib/storage";

export type ClubData = {
  competitions: Competition[];
  /** Roster order, with appearances/goals from completed matches. */
  players: Player[];
  /** Upcoming, soonest first. */
  fixtures: Match[];
  /** Completed, most recent first. */
  results: Match[];
};

type CompetitionRow = { id: string; name: string; season: string; status: string; summary: string };

type PlayerRow = {
  id: string;
  name: string;
  number: number | null;
  position: Position;
  captain: boolean;
  active: boolean;
  photo_path: string | null;
};

type MatchRow = {
  id: string;
  stage: string;
  match_date: string | null;
  kickoff: string | null;
  venue: string | null;
  opponent: string;
  home_away: Match["homeAway"];
  our_score: number | null;
  opponent_score: number | null;
  pens_for: number | null;
  pens_against: number | null;
  status: Match["status"];
  forfeit: boolean;
  note: string | null;
  competitions: { name: string; season: string };
  match_players: { name: string; player_id: string | null; goals: number; lineup_order: number }[];
};

function toMatch(row: MatchRow): Match {
  const lineup = [...row.match_players].sort((a, b) => a.lineup_order - b.lineup_order);
  const scorers: Scorer[] = lineup
    .filter((p) => p.goals > 0)
    .map((p) => ({ name: p.name, playerId: p.player_id, goals: p.goals }));

  return {
    id: row.id,
    competition: row.competitions.name,
    season: row.competitions.season,
    stage: row.stage,
    date: row.match_date,
    time: row.kickoff,
    venue: row.venue,
    opponent: row.opponent,
    homeAway: row.home_away,
    nyFanaticosScore: row.our_score,
    opponentScore: row.opponent_score,
    penaltiesFor: row.pens_for,
    penaltiesAgainst: row.pens_against,
    status: row.status,
    forfeit: row.forfeit,
    note: row.note ?? undefined,
    lineup: lineup.map((p) => p.name),
    squadPlayerIds: lineup.flatMap((p) => (p.player_id ? [p.player_id] : [])),
    scorers,
  };
}

/**
 * All club data in one round of queries. Wrapped in React's `cache` so a
 * page and its generateMetadata share one fetch per request; across
 * requests the Supabase responses are cached by Next (see lib/supabase.ts).
 */
export const getClubData = cache(async (): Promise<ClubData> => {
  const supabase = createPublicClient();

  const [competitionsRes, playersRes, matchesRes] = await Promise.all([
    supabase
      .from("competitions")
      .select("id, name, season, status, summary")
      .order("starts_on", { ascending: false, nullsFirst: true })
      .order("name"),
    supabase
      .from("players")
      .select("id, name, number, position, captain, active, photo_path")
      .order("sort_order")
      .order("name"),
    supabase
      .from("matches")
      .select(
        "id, stage, match_date, kickoff, venue, opponent, home_away, our_score, opponent_score, pens_for, pens_against, status, forfeit, note, competitions(name, season), match_players(name, player_id, goals, lineup_order)",
      ),
  ]);

  // Throw rather than render an empty site: on failure Next keeps serving the last good page.
  for (const res of [competitionsRes, playersRes, matchesRes]) {
    if (res.error) throw new Error(`Supabase query failed: ${res.error.message}`);
  }

  const matches = (matchesRes.data as unknown as MatchRow[]).map(toMatch);
  const fixtures = matches.filter((m) => m.status === "scheduled").sort((a, b) => -byDateDesc(a, b));
  const results = matches.filter((m) => m.status === "final").sort(byDateDesc);

  const roster: RosterEntry[] = (playersRes.data as PlayerRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    number: p.number,
    position: p.position,
    captain: p.captain,
    active: p.active,
    photoUrl: playerPhotoUrl(p.photo_path),
  }));

  return {
    competitions: competitionsRes.data as CompetitionRow[],
    players: buildPlayers(roster, results),
    fixtures,
    results,
  };
});
