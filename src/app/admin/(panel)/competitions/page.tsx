import Link from "next/link";
import { formatDate } from "@/lib/date";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function AdminCompetitionsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("competitions")
    .select("id, name, season, status, starts_on, matches(status)")
    .order("starts_on", { ascending: false, nullsFirst: true })
    .order("name");
  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Competitions</h1>
          <p className="mt-1 text-sm text-muted">Each league or cup per season. Listed on the homepage in this order.</p>
        </div>
        <Link href="/admin/competitions/new" className="bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-background hover:opacity-90">
          Add competition
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-border border border-border">
        {(data ?? []).map((c) => {
          const played = c.matches.filter((m) => m.status === "final").length;
          const upcoming = c.matches.length - played;
          return (
            <li key={c.id}>
              <Link href={`/admin/competitions/${c.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-background-alt">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg tracking-wide">
                    {c.name} <span className="text-muted">— {c.season}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {c.starts_on ? `Starts ${formatDate(c.starts_on)} · ` : ""}
                    {played} played{upcoming ? ` · ${upcoming} upcoming` : ""}
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-accent">{c.status}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
