import Link from "next/link";
import { playerPhotoUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/supabaseServer";

type Row = {
  id: string;
  name: string;
  number: number | null;
  position: string;
  captain: boolean;
  active: boolean;
  photo_path: string | null;
  sort_order: number;
};

export default async function AdminPlayersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: players, error }, { data: names }] = await Promise.all([
    supabase.from("players").select("id, name, number, position, captain, active, photo_path, sort_order").order("sort_order").order("name"),
    supabase.from("match_player_names").select("player_id, appearances, goals"),
  ]);
  if (error) throw new Error(error.message);

  const stats = new Map<string, { apps: number; goals: number }>();
  for (const n of names ?? []) {
    if (!n.player_id) continue;
    const s = stats.get(n.player_id) ?? { apps: 0, goals: 0 };
    s.apps += n.appearances;
    s.goals += n.goals;
    stats.set(n.player_id, s);
  }
  const guestNames = (names ?? []).filter((n) => !n.player_id).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Players</h1>
          <p className="mt-1 text-sm text-muted">
            {(players as Row[]).filter((p) => p.active).length} active · {guestNames} guest names in match history
          </p>
        </div>
        <Link href="/admin/players/new" className="bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-background hover:opacity-90">
          Add player
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-border border border-border">
        {(players as Row[]).map((p) => {
          const url = playerPhotoUrl(p.photo_path);
          const s = stats.get(p.id);
          return (
            <li key={p.id}>
              <Link href={`/admin/players/${p.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-background-alt">
                <div className="h-12 w-9 shrink-0 overflow-hidden bg-background-alt">
                  {url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="w-8 shrink-0 text-right font-display text-lg text-muted">{p.number ?? "–"}</span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate font-display text-lg tracking-wide ${p.active ? "" : "text-muted line-through"}`}>
                    {p.name}
                    {p.captain && <span className="ml-2 text-xs text-accent">C</span>}
                  </div>
                  <div className="text-xs uppercase tracking-[0.15em] text-muted">
                    {p.position}
                    {!p.active && " · inactive"}
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm text-muted">
                  {s?.apps ?? 0} apps · {s?.goals ?? 0} G
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
