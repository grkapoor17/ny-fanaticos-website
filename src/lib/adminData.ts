import type { SupabaseClient } from "@supabase/supabase-js";
import type { SquadOption } from "@/components/admin/MatchForm";

type NameRow = { name: string; player_id: string | null; appearances: number };

/**
 * Everything the match form needs to offer: competitions, previously used
 * stages/venues (for autocomplete) and the squad with each player's
 * matchday name — the short name recorded in lineups and shown in scorer
 * lists. That's the name a player has been recorded under most often
 * ("Revanth"), else their first name, else (if two players would share
 * it) their full name.
 */
export async function getMatchFormOptions(supabase: SupabaseClient) {
  const [competitions, players, names, matches] = await Promise.all([
    supabase.from("competitions").select("id, name, season").order("starts_on", { ascending: false, nullsFirst: true }).order("name"),
    supabase.from("players").select("id, name, active").order("sort_order").order("name"),
    supabase.from("match_player_names").select("name, player_id, appearances").not("player_id", "is", null),
    supabase.from("matches").select("stage, venue"),
  ]);
  for (const res of [competitions, players, names, matches]) if (res.error) throw new Error(res.error.message);

  const usual = new Map<string, NameRow>();
  for (const row of names.data as NameRow[]) {
    const current = usual.get(row.player_id!);
    if (!current || row.appearances > current.appearances) usual.set(row.player_id!, row);
  }

  const draft = (players.data as { id: string; name: string; active: boolean }[]).map((p) => ({
    ...p,
    hasHistory: usual.has(p.id),
    matchdayName: usual.get(p.id)?.name ?? p.name.split(/\s+/)[0],
  }));
  const counts = new Map<string, number>();
  for (const p of draft) counts.set(p.matchdayName.toLowerCase(), (counts.get(p.matchdayName.toLowerCase()) ?? 0) + 1);
  const squad: SquadOption[] = draft.map((p) => ({
    id: p.id,
    name: p.name,
    active: p.active,
    matchdayName: !p.hasHistory && counts.get(p.matchdayName.toLowerCase())! > 1 ? p.name : p.matchdayName,
  }));

  const distinct = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
  const rows = matches.data as { stage: string; venue: string | null }[];

  return {
    competitions: competitions.data as { id: string; name: string; season: string }[],
    squad,
    stages: distinct(["Regular Season", "Group Stage", "Quarterfinal", "Semifinal", "Final", ...rows.map((r) => r.stage)]),
    venues: distinct(rows.map((r) => r.venue)),
  };
}
