/**
 * One-time (safely re-runnable) import of all existing club data into
 * Supabase:
 *   - competitions   <- src/data/competitions.ts
 *   - players        <- roster in src/data/players.ts (+ photos in public/players)
 *   - matches        <- static history in src/data/matches.ts
 *                       + Fall 2026 Google Sheets (src/lib/sheetMatches.ts)
 *   - match_players  <- each match's lineup + scorers
 *
 * Usage:  npx tsx --env-file=.env.local scripts/migrate-to-supabase.ts [--dry-run]
 * Needs:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_SHEETS_API_KEY
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws"; // Node 20 has no native WebSocket, which supabase-js requires
import { competitions } from "../src/data/competitions";
import { fixtures as staticFixtures, results as staticResults, type Match } from "../src/data/matches";
import { matchdayAliases, roster } from "../src/data/players";
import { getSheetMatches } from "../src/lib/sheetMatches";

const DRY_RUN = process.argv.includes("--dry-run");
const EXPECTED_SHEET_MATCHES = 18; // Fall 2026 as of Nov 24 2026 (9 Bowery + 9 MW)

/**
 * Matchday names that weren't in players.ts' alias map but are the same
 * person. Confirm with the club before adding anything here.
 */
const EXTRA_ALIASES: Record<string, string[]> = {
  ugur: ["UG"],
};

const PHOTO_BUCKET = "player-photos";
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name} (add it to .env.local)`);
  return value;
}

/** Sheets contain both '2026-10-24' and '10/31/2026'; store ISO dates only. */
function toIsoDate(raw: string | null, matchId: string): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  throw new Error(`Unrecognised date "${raw}" on match ${matchId}`);
}

async function main() {
  // ---- Gather source data -------------------------------------------------
  const sheetMatches = await getSheetMatches();
  if (sheetMatches.length < EXPECTED_SHEET_MATCHES) {
    // getSheetMatches() swallows errors and returns [] — don't silently import nothing.
    throw new Error(`Only got ${sheetMatches.length} matches from Google Sheets, expected >= ${EXPECTED_SHEET_MATCHES}`);
  }
  const allMatches: Match[] = [...staticResults, ...staticFixtures, ...sheetMatches];

  const nameToPlayerId = new Map<string, string>();
  for (const [playerId, names] of Object.entries({ ...matchdayAliases })) {
    for (const name of [...names, ...(EXTRA_ALIASES[playerId] ?? [])]) nameToPlayerId.set(name, playerId);
  }

  const competitionIdByKey = new Map(competitions.map((c) => [`${c.name}|${c.season}`, c.id]));

  // ---- Competitions -------------------------------------------------------
  const firstDateByCompetition = new Map<string, string>();
  const matchRows = allMatches.map((m) => {
    const competitionId = competitionIdByKey.get(`${m.competition}|${m.season}`);
    if (!competitionId) throw new Error(`Match ${m.id}: no competition for ${m.competition} / ${m.season}`);
    const matchDate = toIsoDate(m.date, m.id);
    if (matchDate) {
      const prev = firstDateByCompetition.get(competitionId);
      if (!prev || matchDate < prev) firstDateByCompetition.set(competitionId, matchDate);
    }
    return {
      id: m.id,
      competition_id: competitionId,
      stage: m.stage,
      match_date: matchDate,
      kickoff: m.time,
      venue: m.venue,
      opponent: m.opponent,
      home_away: m.homeAway,
      our_score: m.nyFanaticosScore,
      opponent_score: m.opponentScore,
      pens_for: m.penaltiesFor,
      pens_against: m.penaltiesAgainst,
      status: m.status,
      note: m.note ?? null,
    };
  });

  const competitionRows = competitions.map((c) => ({
    id: c.id,
    name: c.name,
    season: c.season,
    status: c.status,
    summary: c.summary,
    starts_on: firstDateByCompetition.get(c.id) ?? null,
  }));

  // ---- Who played in each match --------------------------------------------
  const warnings: string[] = [];
  const matchPlayerRows = allMatches.flatMap((m) => {
    const goalsByName = new Map<string, number>();
    for (const s of m.scorers ?? []) goalsByName.set(s.name, (goalsByName.get(s.name) ?? 0) + s.goals);

    const names: string[] = [];
    for (const name of m.lineup ?? []) {
      if (names.includes(name)) warnings.push(`${m.id}: "${name}" listed twice in lineup — kept once`);
      else names.push(name);
    }
    for (const name of goalsByName.keys()) {
      if (!names.includes(name)) {
        warnings.push(`${m.id}: scorer "${name}" missing from lineup — added`);
        names.push(name);
      }
    }

    return names.map((name, i) => ({
      match_id: m.id,
      name,
      player_id: nameToPlayerId.get(name) ?? null,
      goals: goalsByName.get(name) ?? 0,
      lineup_order: i,
    }));
  });

  // ---- Players + photos -----------------------------------------------------
  const playerRows = roster.map((p, i) => {
    const ext = PHOTO_EXTENSIONS.find((e) => existsSync(path.join("public/players", `${p.id}.${e}`)));
    return {
      id: p.id,
      name: p.name,
      number: p.number,
      position: p.position,
      captain: p.captain,
      active: p.active,
      photo_path: ext ? `${p.id}.${ext}` : null,
      sort_order: i,
    };
  });

  console.log(
    `competitions: ${competitionRows.length}, players: ${playerRows.length} (${playerRows.filter((p) => p.photo_path).length} with photos), ` +
      `matches: ${matchRows.length} (${sheetMatches.length} from Sheets), match_players: ${matchPlayerRows.length} ` +
      `(${matchPlayerRows.filter((r) => r.player_id).length} linked to squad players)`,
  );
  for (const w of warnings) console.log(`  warning: ${w}`);
  if (DRY_RUN) {
    console.log("Dry run — nothing written.");
    return;
  }

  // ---- Write (order matters for foreign keys) ------------------------------
  const supabase = createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
    // ws works at runtime; its types just don't match supabase-js's WebSocket interface.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    realtime: { transport: ws as any },
  });

  for (const p of playerRows) {
    if (!p.photo_path) continue;
    const ext = p.photo_path.split(".").pop()!;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(p.photo_path, readFileSync(path.join("public/players", p.photo_path)), {
        contentType: CONTENT_TYPES[ext],
        upsert: true,
      });
    if (error) throw new Error(`Photo upload ${p.photo_path}: ${error.message}`);
  }

  const upsert = async (table: string, rows: object[], onConflict: string) => {
    const { error } = await supabase.from(table).upsert(rows, { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  };

  await upsert("competitions", competitionRows, "id");
  await upsert("players", playerRows, "id");
  await upsert("matches", matchRows, "id");

  // Replace lineups wholesale so re-runs reflect removals too.
  const { error: deleteError } = await supabase
    .from("match_players")
    .delete()
    .in("match_id", matchRows.map((m) => m.id));
  if (deleteError) throw new Error(`match_players delete: ${deleteError.message}`);
  await upsert("match_players", matchPlayerRows, "match_id,name");

  console.log("Done.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
