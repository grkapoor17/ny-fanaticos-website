import Link from "next/link";
import { notFound } from "next/navigation";
import { linkGuestName, unlinkName } from "@/app/admin/actions";
import PlayerForm, { DeletePlayerForm, type PlayerFormValues } from "@/components/admin/PlayerForm";
import { SubmitButton, inputClasses } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/supabaseServer";

type NameRow = { name: string; player_id: string | null; appearances: number; goals: number };

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: player }, { data: names }] = await Promise.all([
    supabase.from("players").select("id, name, number, position, captain, active, photo_path, sort_order").eq("id", id).maybeSingle(),
    supabase.from("match_player_names").select("name, player_id, appearances, goals"),
  ]);
  if (!player) notFound();

  const linked = ((names ?? []) as NameRow[]).filter((n) => n.player_id === id).sort((a, b) => b.appearances - a.appearances);
  const guests = ((names ?? []) as NameRow[])
    .filter((n) => !n.player_id)
    .sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name));
  const totalApps = linked.reduce((s, n) => s + n.appearances, 0);
  const totalGoals = linked.reduce((s, n) => s + n.goals, 0);

  return (
    <div className="space-y-16">
      <div>
        <Link href="/admin/players" className="text-xs uppercase tracking-wide text-muted hover:text-foreground">
          ← Players
        </Link>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-5xl">{player.name}</h1>
          <Link href={`/squad/${id}`} className="text-sm text-accent" target="_blank">
            View on site →
          </Link>
        </div>
        <div className="mt-8">
          <PlayerForm mode="edit" initial={player as PlayerFormValues} />
        </div>
      </div>

      <section>
        <h2 className="font-display text-3xl">Match history</h2>
        <p className="mt-1 text-sm text-muted">
          {totalApps} appearances · {totalGoals} goals, from lineups recorded under these names.
        </p>

        {linked.length > 0 ? (
          <ul className="mt-4 divide-y divide-border border border-border">
            {linked.map((n) => (
              <li key={n.name} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span>
                  &ldquo;{n.name}&rdquo; <span className="text-muted">· {n.appearances} apps · {n.goals} G</span>
                </span>
                <form action={unlinkName}>
                  <input type="hidden" name="player_id" value={id} />
                  <input type="hidden" name="name" value={n.name} />
                  <button type="submit" className="text-xs uppercase tracking-wide text-muted hover:text-red-400">
                    Unlink
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No appearances linked yet.</p>
        )}

        {guests.length > 0 && (
          <form action={linkGuestName} className="mt-6 flex flex-wrap items-end gap-3">
            <input type="hidden" name="player_id" value={id} />
            <label className="block min-w-64 flex-1 space-y-2">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">Credit guest appearances to {player.name}</span>
              <select name="name" required defaultValue="" className={inputClasses}>
                <option value="" disabled>
                  Pick the name used on matchday…
                </option>
                {guests.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} ({g.appearances} apps, {g.goals} G)
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton variant="quiet" pendingLabel="Linking…">
              Link
            </SubmitButton>
          </form>
        )}
      </section>

      <section className="border-t border-border pt-10">
        <h2 className="font-display text-3xl text-red-400">Delete player</h2>
        <div className="mt-4">
          <DeletePlayerForm id={id} name={player.name} appearances={totalApps} />
        </div>
      </section>
    </div>
  );
}
