/**
 * Squad data model. The roster lives in Supabase (table `players`) and is
 * loaded by src/lib/clubData.ts. Appearances and goals are NOT stored —
 * they're derived from completed matches (each match's `squadPlayerIds` /
 * `scorers`), so the numbers can't drift out of sync with match history.
 * Guests who aren't on the roster stay in match history but aren't
 * aggregated onto a squad profile. Assists aren't tracked.
 */

import type { Match } from "./matches";

export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export type Player = {
  id: string;
  name: string;
  number: number | null;
  position: Position;
  appearances: number;
  goals: number;
  captain: boolean;
  active: boolean;
  photoUrl: string | null;
};

export type RosterEntry = Omit<Player, "appearances" | "goals">;

function playedIn(match: Match, id: string): boolean {
  return match.squadPlayerIds.includes(id);
}

function goalsIn(match: Match, id: string): number {
  return match.scorers.filter((s) => s.playerId === id).reduce((sum, s) => sum + s.goals, 0);
}

function computeStats(id: string, matches: Match[]): { appearances: number; goals: number } {
  let appearances = 0;
  let goals = 0;
  for (const match of matches) {
    if (playedIn(match, id)) appearances += 1;
    goals += goalsIn(match, id);
  }
  return { appearances, goals };
}

/** Roster (in display order) plus stats from the given completed matches. */
export function buildPlayers(roster: RosterEntry[], matches: Match[]): Player[] {
  return roster.map((p) => ({ ...p, ...computeStats(p.id, matches) }));
}

export const positionOrder: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export function playersByPosition(players: Player[], position: Position): Player[] {
  return players
    .filter((p) => p.position === position)
    .sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity) || a.name.localeCompare(b.name));
}

export function featuredPlayers(players: Player[]): Player[] {
  return players.slice(0, 6);
}

export function getPlayer(players: Player[], id: string): Player | null {
  return players.find((p) => p.id === id) ?? null;
}

export type PlayerMatchLine = {
  match: Match;
  goals: number;
};

export type PlayerSeason = {
  key: string;
  competition: string;
  season: string;
  appearances: number;
  goals: number;
  matches: PlayerMatchLine[];
};

/** Season-by-season breakdown (most recent first), each with per-match detail. */
export function getPlayerSeasons(id: string, matches: Match[]): PlayerSeason[] {
  const seasons = new Map<string, PlayerSeason>();
  for (const match of matches) {
    if (!playedIn(match, id)) continue;

    const key = `${match.competition} — ${match.season}`;
    const goals = goalsIn(match, id);

    let season = seasons.get(key);
    if (!season) {
      season = { key, competition: match.competition, season: match.season, appearances: 0, goals: 0, matches: [] };
      seasons.set(key, season);
    }
    season.appearances += 1;
    season.goals += goals;
    season.matches.push({ match, goals });
  }

  for (const season of seasons.values()) {
    season.matches.sort((a, b) => {
      if (!a.match.date || !b.match.date) return 0;
      return a.match.date < b.match.date ? 1 : -1;
    });
  }

  return Array.from(seasons.values()).sort((a, b) => {
    const dateA = a.matches[0]?.match.date ?? "";
    const dateB = b.matches[0]?.match.date ?? "";
    return dateA < dateB ? 1 : -1;
  });
}

/** Earliest recorded match a player appeared in, or null if none/undated. */
export function getPlayerDebut(id: string, matches: Match[]): Match | null {
  const appearances = matches.filter((m) => m.date && playedIn(m, id));
  if (appearances.length === 0) return null;

  return appearances.reduce((earliest, m) => (m.date! < earliest.date! ? m : earliest));
}
