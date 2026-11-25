import type { SupabaseClient } from "@supabase/supabase-js";
import { amountDue, computeShares, paidByPlayer, summarise, type FeeType, type SquadSummary } from "@/lib/squadFees";

type MemberRow = {
  player_id: string;
  fee_type: FeeType;
  custom_fee_cents: number | null;
  note: string | null;
  players: { name: string; number: number | null; active: boolean };
};

export type PaymentRow = {
  id: string;
  player_id: string;
  amount_cents: number;
  paid_on: string;
  method: string | null;
  note: string | null;
};

export type SquadMember = {
  playerId: string;
  name: string;
  number: number | null;
  feeType: FeeType;
  customFeeCents: number | null;
  note: string | null;
  dueCents: number;
  paidCents: number;
  /** Positive = still owes; negative = overpaid. */
  balanceCents: number;
  appearances: number;
};

/** Someone who played in this competition without being in its squad. */
export type NonSquadAppearance = { name: string; playerId: string | null; appearances: number };

function check<T extends { error: { message: string } | null }>(res: T): T {
  if (res.error) throw new Error(res.error.message);
  return res;
}

/** Everything the squad & fees page for one competition shows. */
export async function getSquadPage(supabase: SupabaseClient, competitionId: string) {
  const [competition, fee, members, payments, matches, players, otherSquads] = await Promise.all([
    supabase.from("competitions").select("id, name, season").eq("id", competitionId).maybeSingle(),
    supabase.from("competition_fees").select("league_fee_cents").eq("competition_id", competitionId).maybeSingle(),
    supabase
      .from("squad_members")
      .select("player_id, fee_type, custom_fee_cents, note, players(name, number, active)")
      .eq("competition_id", competitionId),
    supabase
      .from("squad_payments")
      .select("id, player_id, amount_cents, paid_on, method, note")
      .eq("competition_id", competitionId)
      .order("paid_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("matches").select("match_players(name, player_id)").eq("competition_id", competitionId).eq("status", "final"),
    supabase.from("players").select("id, name, active").order("sort_order").order("name"),
    supabase.from("squad_members").select("competition_id, competitions(name, season)").neq("competition_id", competitionId),
  ]).then((all) => all.map(check) as typeof all);
  if (!competition.data) return null;

  // Appearances in this competition: squad players by id, everyone else by id or (guests) by name.
  const appsById = new Map<string, number>();
  const others = new Map<string, NonSquadAppearance>();
  const memberRows = (members.data ?? []) as unknown as MemberRow[];
  const inSquad = new Set(memberRows.map((m) => m.player_id));
  const playerNames = new Map((players.data ?? []).map((p) => [p.id as string, p.name as string]));
  for (const match of (matches.data ?? []) as { match_players: { name: string; player_id: string | null }[] }[]) {
    for (const mp of match.match_players) {
      if (mp.player_id) appsById.set(mp.player_id, (appsById.get(mp.player_id) ?? 0) + 1);
      if (mp.player_id && inSquad.has(mp.player_id)) continue;
      const key = mp.player_id ?? `guest:${mp.name.toLowerCase()}`;
      const entry = others.get(key) ?? {
        name: mp.player_id ? playerNames.get(mp.player_id) ?? mp.name : mp.name,
        playerId: mp.player_id,
        appearances: 0,
      };
      entry.appearances++;
      others.set(key, entry);
    }
  }

  const leagueFeeCents = (fee.data?.league_fee_cents as number | undefined) ?? null;
  const paymentRows = (payments.data ?? []) as PaymentRow[];
  const shares = computeShares(leagueFeeCents ?? 0, memberRows);
  const paid = paidByPlayer(paymentRows);
  const squad: SquadMember[] = memberRows
    .map((m) => {
      const dueCents = leagueFeeCents === null ? 0 : amountDue(m, shares);
      const paidCents = paid.get(m.player_id) ?? 0;
      return {
        playerId: m.player_id,
        name: m.players.name,
        number: m.players.number,
        feeType: m.fee_type,
        customFeeCents: m.custom_fee_cents,
        note: m.note,
        dueCents,
        paidCents,
        balanceCents: dueCents - paidCents,
        appearances: appsById.get(m.player_id) ?? 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const copySources = new Map<string, string>();
  for (const row of (otherSquads.data ?? []) as unknown as { competition_id: string; competitions: { name: string; season: string } }[]) {
    copySources.set(row.competition_id, `${row.competitions.name} — ${row.competitions.season}`);
  }

  return {
    competition: competition.data as { id: string; name: string; season: string },
    leagueFeeCents,
    summary: summarise(leagueFeeCents ?? 0, memberRows, paymentRows),
    squad,
    payments: paymentRows.map((p) => ({ ...p, name: playerNames.get(p.player_id) ?? p.player_id })),
    nonSquad: [...others.values()].sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name)),
    addablePlayers: ((players.data ?? []) as { id: string; name: string; active: boolean }[]).filter(
      (p) => p.active && !inSquad.has(p.id),
    ),
    copySources: [...copySources].map(([id, label]) => ({ id, label })),
  };
}

export type CompetitionFeeOverview = {
  id: string;
  name: string;
  season: string;
  status: string;
  /** null when neither a fee nor a squad has been set up yet. */
  summary: SquadSummary | null;
  hasFee: boolean;
};

/** One summary line per competition, newest first (squads page + dashboard). */
export async function getSquadsOverview(supabase: SupabaseClient): Promise<CompetitionFeeOverview[]> {
  const [competitions, fees, members, payments] = await Promise.all([
    supabase.from("competitions").select("id, name, season, status").order("starts_on", { ascending: false, nullsFirst: true }).order("name"),
    supabase.from("competition_fees").select("competition_id, league_fee_cents"),
    supabase.from("squad_members").select("competition_id, player_id, fee_type, custom_fee_cents"),
    supabase.from("squad_payments").select("competition_id, player_id, amount_cents"),
  ]).then((all) => all.map(check) as typeof all);

  const feeBy = new Map((fees.data ?? []).map((f) => [f.competition_id as string, f.league_fee_cents as number]));
  const group = <T extends { competition_id: string }>(rows: T[]) => {
    const m = new Map<string, T[]>();
    for (const r of rows) m.set(r.competition_id, [...(m.get(r.competition_id) ?? []), r]);
    return m;
  };
  const membersBy = group((members.data ?? []) as { competition_id: string; player_id: string; fee_type: FeeType; custom_fee_cents: number | null }[]);
  const paymentsBy = group((payments.data ?? []) as { competition_id: string; player_id: string; amount_cents: number }[]);

  return ((competitions.data ?? []) as { id: string; name: string; season: string; status: string }[]).map((c) => {
    const fee = feeBy.get(c.id);
    const squad = membersBy.get(c.id) ?? [];
    const setUp = fee !== undefined || squad.length > 0;
    return {
      ...c,
      hasFee: fee !== undefined,
      summary: setUp ? summarise(fee ?? 0, squad, paymentsBy.get(c.id) ?? []) : null,
    };
  });
}
