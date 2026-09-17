/**
 * Squad data model, built to support individual player pages and full
 * statistics. Appearances and goals are NOT hand-maintained here — they're
 * derived from completed matches (each match's `lineup`/`scorers`), so the
 * numbers can't drift out of sync with match history. Callers pass in the
 * match list (see src/lib/matches.ts, which merges the static history in
 * src/data/matches.ts with the live Google Sheet seasons). Assists aren't
 * tracked (not recorded reliably by the club).
 *
 * Positions are placeholder (all "Midfielder") until the club provides
 * real ones — update as that info comes in.
 */

import type { Match } from "./matches";

export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  appearances: number;
  goals: number;
  captain: boolean;
  active: boolean;
};

type RosterEntry = Omit<Player, "appearances" | "goals">;

/**
 * Maps a roster player to the exact name(s) used for them on matchday
 * sheets. Only names listed here count toward a player's stats — everyone
 * else in a match's lineup/scorers (guests, one-off call-ups) is still
 * recorded in match history, just not aggregated onto a squad profile.
 */
const matchdayAliases: Record<string, string[]> = {
  gautam: ["Gautam"],
  avi: ["Avi"],
  rev: ["Revanth"],
  caleb: ["Caleb"],
  onur: ["Onur"],
  ben: ["Ben"],
  vikram: ["Vikram"],
  sriram: ["Sriram"],
  varun: ["Varun"],
  roger: ["Roger"],
  miles: ["Miles"],
  max: ["Max"],
  lucas: ["Lucas"],
  sid: ["Sid"],
  ugur: ["Ugur"],
};

const roster: RosterEntry[] = [
  { id: "gautam", name: "Gautam Kapoor", number: 10, position: "Midfielder", captain: true, active: true },
  { id: "avi", name: "Avi Jaiswal", number: 17, position: "Defender", captain: false, active: true },
  { id: "rev", name: "Revanth Pothana", number: 6, position: "Midfielder", captain: false, active: true },
  { id: "caleb", name: "Caleb Smith-Salzberg", number: 18, position: "Defender", captain: false, active: true },
  { id: "onur", name: "Onur Gurol", number: 11, position: "Forward", captain: false, active: true },
  { id: "ben", name: "Ben Richardson", number: 19, position: "Midfielder", captain: false, active: true },
  { id: "vikram", name: "Vikram Arun", number: 3, position: "Defender", captain: false, active: true },
  { id: "sriram", name: "Sriram Chidambaram", number: 33, position: "Goalkeeper", captain: false, active: true },
  { id: "varun", name: "Varun Giri", number: 21, position: "Midfielder", captain: false, active: true },
  { id: "roger", name: "Roger Freites", number: 9, position: "Forward", captain: false, active: true },
  { id: "miles", name: "Miles Rochester", number: 8, position: "Midfielder", captain: false, active: true },
  { id: "max", name: "Max Rochester", number: 7, position: "Forward", captain: false, active: true },
  { id: "lucas", name: "Lucas Vienne", number: 1, position: "Goalkeeper", captain: false, active: true },
  { id: "sid", name: "Siddharth Kapoor", number: 99, position: "Goalkeeper", captain: false, active: true },
  { id: "ugur", name: "Ugur Gurol", number: 4, position: "Defender", captain: false, active: true },
];

export const rosterIds: string[] = roster.map((p) => p.id);

function computeStats(id: string, matches: Match[]): { appearances: number; goals: number } {
  const aliases = new Set(matchdayAliases[id] ?? []);
  if (aliases.size === 0) return { appearances: 0, goals: 0 };

  let appearances = 0;
  let goals = 0;
  for (const match of matches) {
    if (match.lineup?.some((name) => aliases.has(name))) {
      appearances += 1;
    }
    for (const scorer of match.scorers ?? []) {
      if (aliases.has(scorer.name)) {
        goals += scorer.goals;
      }
    }
  }
  return { appearances, goals };
}

export function buildPlayers(matches: Match[]): Player[] {
  return roster.map((p) => ({ ...p, ...computeStats(p.id, matches) }));
}

export const squadIsPlaceholder = false;

export const positionOrder: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export function playersByPosition(players: Player[], position: Position): Player[] {
  return players.filter((p) => p.position === position).sort((a, b) => a.number - b.number);
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
  const aliases = new Set(matchdayAliases[id] ?? []);
  if (aliases.size === 0) return [];

  const seasons = new Map<string, PlayerSeason>();
  for (const match of matches) {
    if (!match.lineup?.some((name) => aliases.has(name))) continue;

    const key = `${match.competition} — ${match.season}`;
    const goals = (match.scorers ?? [])
      .filter((s) => aliases.has(s.name))
      .reduce((sum, s) => sum + s.goals, 0);

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
  const aliases = new Set(matchdayAliases[id] ?? []);
  if (aliases.size === 0) return null;

  const appearances = matches.filter((m) => m.date && m.lineup?.some((name) => aliases.has(name)));
  if (appearances.length === 0) return null;

  return appearances.reduce((earliest, m) =>
    m.date! < earliest.date! ? m : earliest
  );
}
