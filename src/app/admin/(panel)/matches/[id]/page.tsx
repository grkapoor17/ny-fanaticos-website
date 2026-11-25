import Link from "next/link";
import { notFound } from "next/navigation";
import type { LineupEntry } from "@/app/admin/actions";
import MatchForm, { DeleteMatchForm, type MatchFormValues } from "@/components/admin/MatchForm";
import { getMatchFormOptions } from "@/lib/adminData";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: match }, options] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, competition_id, stage, match_date, kickoff, venue, opponent, home_away, our_score, opponent_score, pens_for, pens_against, status, forfeit, note, match_players(name, player_id, goals, lineup_order)",
      )
      .eq("id", id)
      .maybeSingle(),
    getMatchFormOptions(supabase),
  ]);
  if (!match) notFound();

  const { match_players, ...values } = match as MatchFormValues & {
    match_players: (LineupEntry & { lineup_order: number })[];
  };
  const lineup = [...match_players]
    .sort((a, b) => a.lineup_order - b.lineup_order)
    .map(({ name, player_id, goals }) => ({ name, player_id, goals }));

  return (
    <div className="space-y-16">
      <div>
        <Link href="/admin/matches" className="text-xs uppercase tracking-wide text-muted hover:text-foreground">
          ← Matches
        </Link>
        <h1 className="mt-4 font-display text-5xl">vs {values.opponent}</h1>
        <div className="mt-8">
          <MatchForm {...options} initial={values} initialLineup={lineup} />
        </div>
      </div>

      <section className="border-t border-border pt-10">
        <h2 className="font-display text-3xl text-red-400">Delete match</h2>
        <div className="mt-4">
          <DeleteMatchForm id={id} label={`the match vs ${values.opponent}`} />
        </div>
      </section>
    </div>
  );
}
