/**
 * Squad data model, built to support individual player pages and full
 * statistics later. Appearances and goals are NOT hand-maintained here —
 * they're derived automatically from src/data/matches.ts (each match's
 * `lineup`/`scorers`), so the numbers can't drift out of sync with match
 * history. Assists aren't tracked (not recorded reliably by the club).
 *
 * Positions are placeholder (all "Midfielder") until the club provides
 * real ones — update as that info comes in.
 */

import { results } from "./matches";

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
 * sheets in src/data/matches.ts. Only names listed here count toward a
 * player's stats — everyone else in a match's lineup/scorers (guests,
 * one-off call-ups) is still recorded in match history, just not
 * aggregated onto a squad profile.
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
];

function computeStats(id: string): { appearances: number; goals: number } {
  const aliases = new Set(matchdayAliases[id] ?? []);
  if (aliases.size === 0) return { appearances: 0, goals: 0 };

  let appearances = 0;
  let goals = 0;
  for (const match of results) {
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

export const players: Player[] = roster.map((p) => ({ ...p, ...computeStats(p.id) }));

export const squadIsPlaceholder = false;

export const positionOrder: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export function playersByPosition(position: Position): Player[] {
  return players.filter((p) => p.position === position).sort((a, b) => a.number - b.number);
}

export const featuredPlayers: Player[] = players.slice(0, 6);
