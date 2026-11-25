/**
 * Checks that Supabase holds the same data the live site currently shows.
 * Reads with the public (anon) key, so it also proves visitors can read —
 * and attempts a write, which must be rejected.
 *
 * Usage:  npx tsx --env-file=.env.local scripts/verify-migration.ts
 * Needs:  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GOOGLE_SHEETS_API_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { competitions } from "../src/data/competitions";
import { fixtures as staticFixtures, results as staticResults, type Match } from "../src/data/matches";
import { buildPlayers, roster } from "../src/data/players";
import { getSheetMatches } from "../src/lib/sheetMatches";

type DbMatch = {
  id: string;
  competition_id: string;
  match_date: string | null;
  opponent: string;
  our_score: number | null;
  opponent_score: number | null;
  status: string;
  match_players: { name: string; player_id: string | null; goals: number }[];
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

async function main() {
  const supabase = createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
  });
  const problems: string[] = [];
  const notes: string[] = [];

  // ---- Source of truth today ----------------------------------------------
  const sheetMatches = await getSheetMatches();
  const sourceMatches: Match[] = [...staticResults, ...staticFixtures, ...sheetMatches];
  const sourceById = new Map(sourceMatches.map((m) => [m.id, m]));

  // ---- What's in Supabase ---------------------------------------------------
  const [{ data: dbMatches, error: mErr }, { data: dbPlayers, error: pErr }, { data: dbComps, error: cErr }] =
    await Promise.all([
      supabase.from("matches").select("id, competition_id, match_date, opponent, our_score, opponent_score, status, match_players(name, player_id, goals)"),
      supabase.from("players").select("id, name, photo_path"),
      supabase.from("competitions").select("id"),
    ]);
  if (mErr || pErr || cErr) throw new Error((mErr ?? pErr ?? cErr)!.message);

  if (dbComps!.length !== competitions.length) problems.push(`competitions: db ${dbComps!.length} vs source ${competitions.length}`);
  if (dbPlayers!.length !== roster.length) problems.push(`players: db ${dbPlayers!.length} vs source ${roster.length}`);
  if (dbMatches!.length !== sourceMatches.length) problems.push(`matches: db ${dbMatches!.length} vs source ${sourceMatches.length}`);

  // ---- Match by match -------------------------------------------------------
  for (const db of dbMatches as DbMatch[]) {
    const src = sourceById.get(db.id);
    if (!src) {
      problems.push(`${db.id}: in db but not in source`);
      continue;
    }
    if (db.opponent !== src.opponent || db.status !== src.status) problems.push(`${db.id}: opponent/status differ`);
    if (db.our_score !== src.nyFanaticosScore || db.opponent_score !== src.opponentScore) problems.push(`${db.id}: score differs`);

    const srcLineup = [...new Set(src.lineup ?? [])].sort().join(",");
    const dbLineup = db.match_players.map((p) => p.name).sort().join(",");
    if (srcLineup !== dbLineup) problems.push(`${db.id}: lineup differs\n    source: ${srcLineup}\n    db:     ${dbLineup}`);

    const srcGoals = (src.scorers ?? []).reduce((s, x) => s + x.goals, 0);
    const dbGoals = db.match_players.reduce((s, x) => s + x.goals, 0);
    if (srcGoals !== dbGoals) problems.push(`${db.id}: scorer goals differ (source ${srcGoals}, db ${dbGoals})`);

    // Not a migration error, just worth knowing (own goals, unrecorded scorers).
    if (db.status === "final" && db.our_score !== null && dbGoals !== db.our_score) {
      notes.push(`${db.id} vs ${db.opponent}: scored ${db.our_score} but scorers add up to ${dbGoals}`);
    }
  }

  // ---- Player totals (what /squad shows) ------------------------------------
  const sourceResults = sourceMatches.filter((m) => m.status === "final");
  const siteStats = new Map(buildPlayers(sourceResults).map((p) => [p.id, p]));
  console.log("\nplayer           apps (site → db)   goals (site → db)");
  for (const p of roster) {
    let apps = 0;
    let goals = 0;
    for (const m of dbMatches as DbMatch[]) {
      if (m.status !== "final") continue;
      const line = m.match_players.find((mp) => mp.player_id === p.id);
      if (line) {
        apps += 1;
        goals += line.goals;
      }
    }
    const site = siteStats.get(p.id)!;
    const changed = site.appearances !== apps || site.goals !== goals;
    console.log(
      `${p.id.padEnd(16)} ${String(site.appearances).padStart(4)} → ${String(apps).padEnd(10)} ${String(site.goals).padStart(5)} → ${goals}${changed ? "   ← changed" : ""}`,
    );
  }

  // ---- Visitors must not be able to write ------------------------------------
  const { error: writeError } = await supabase.from("players").update({ name: "hacked" }).eq("id", "gautam").select();
  const { data: afterWrite } = await supabase.from("players").select("name").eq("id", "gautam").single();
  if (afterWrite?.name === "hacked") problems.push("SECURITY: anon key was able to update players!");
  else notes.push(`anon write correctly blocked${writeError ? ` (${writeError.message})` : " (0 rows affected)"}`);

  // ---- Photos are publicly reachable -----------------------------------------
  const withPhoto = dbPlayers!.find((p) => p.photo_path);
  if (withPhoto) {
    const { data } = supabase.storage.from("player-photos").getPublicUrl(withPhoto.photo_path!);
    const res = await fetch(data.publicUrl, { method: "HEAD" });
    if (!res.ok) problems.push(`photo ${withPhoto.photo_path} not publicly reachable (${res.status})`);
  }

  console.log("\nnotes:");
  for (const n of notes) console.log(`  - ${n}`);
  console.log(problems.length ? `\nPROBLEMS (${problems.length}):` : "\nNo problems found.");
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(problems.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
