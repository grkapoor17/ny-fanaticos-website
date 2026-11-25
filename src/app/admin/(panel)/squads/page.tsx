import Link from "next/link";
import { getSquadsOverview } from "@/lib/squadData";
import { formatMoney } from "@/lib/squadFees";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function AdminSquadsPage() {
  const { supabase } = await requireAdmin();
  const competitions = await getSquadsOverview(supabase);

  return (
    <div>
      <h1 className="font-display text-5xl">Squads &amp; fees</h1>
      <p className="mt-1 text-sm text-muted">Who signed up for each competition and what they&apos;ve paid. Only admins can see this.</p>
      <ul className="mt-8 divide-y divide-border border border-border">
        {competitions.map((c) => {
          const s = c.summary;
          return (
            <li key={c.id}>
              <Link href={`/admin/squads/${c.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-background-alt">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg tracking-wide">
                    {c.name} <span className="text-muted">— {c.season}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {s
                      ? [
                          `${s.memberCount} in squad`,
                          c.hasFee ? `${formatMoney(s.leagueFeeCents)} fee` : "no fee set",
                          `${formatMoney(s.collectedCents)} collected`,
                        ].join(" · ")
                      : "Not set up"}
                  </div>
                </div>
                {s && c.hasFee && s.memberCount > 0 && (
                  <span className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${s.outstandingCents > 0 ? "text-yellow-300" : "text-green-400"}`}>
                    {s.outstandingCents > 0 ? `${formatMoney(s.outstandingCents)} owed` : "All paid"}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
