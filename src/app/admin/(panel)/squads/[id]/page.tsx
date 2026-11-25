import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AddMembersForm,
  CopySquadForm,
  DeletePaymentButton,
  LeagueFeeForm,
  MemberRow,
  PaymentForm,
  QuickAddButton,
} from "@/components/admin/SquadFees";
import { formatDate } from "@/lib/date";
import { getSquadPage } from "@/lib/squadData";
import { formatMoney } from "@/lib/squadFees";
import { requireAdmin } from "@/lib/supabaseServer";

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background-alt p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-muted">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default async function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const data = await getSquadPage(supabase, id);
  if (!data) notFound();
  const { competition, leagueFeeCents, summary: s, squad, payments, nonSquad } = data;
  const feeSet = leagueFeeCents !== null;
  const collectedPct = s.totalDueCents > 0 ? Math.min(100, Math.round((s.collectedCents / s.totalDueCents) * 100)) : 0;
  const shortfall = feeSet && s.memberCount > 0 ? leagueFeeCents - s.totalDueCents : 0;
  const halfCount = squad.filter((m) => m.feeType === "half").length;
  const customCount = squad.filter((m) => m.feeType === "custom").length;

  return (
    <div className="space-y-14">
      <div>
        <Link href="/admin/squads" className="text-xs uppercase tracking-wide text-muted hover:text-foreground">
          ← Squads &amp; fees
        </Link>
        <h1 className="mt-4 font-display text-5xl">
          {competition.name} <span className="text-muted">— {competition.season}</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Private: only admins can see this page.</p>
      </div>

      {/* ---------------- Summary ---------------- */}
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="League fee">
            <LeagueFeeForm competitionId={competition.id} feeCents={leagueFeeCents} />
          </Tile>
          <Tile label="Each person pays">
            {feeSet && s.shareUnits > 0 ? (
              <>
                <div className="font-display text-3xl">{formatMoney(s.fullShareCents)}</div>
                <div className="text-xs text-muted">
                  full · {formatMoney(s.halfShareCents)} half
                  {customCount ? ` · ${customCount} custom` : ""}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted">{feeSet ? "Add the squad to work this out." : "Set the league fee first."}</div>
            )}
          </Tile>
          <Tile label="Collected">
            <div className="font-display text-3xl">{formatMoney(s.collectedCents)}</div>
            {feeSet && s.totalDueCents > 0 && (
              <>
                <div className="text-xs text-muted">of {formatMoney(s.totalDueCents)} due</div>
                <div className="mt-2 h-1.5 bg-border">
                  <div className="h-full bg-accent" style={{ width: `${collectedPct}%` }} />
                </div>
              </>
            )}
          </Tile>
          <Tile label="Still owed">
            <div className={`font-display text-3xl ${s.outstandingCents > 0 ? "text-yellow-300" : ""}`}>{formatMoney(s.outstandingCents)}</div>
            <div className="text-xs text-muted">
              {s.owingCount ? `from ${s.owingCount} ${s.owingCount === 1 ? "person" : "people"}` : feeSet && s.memberCount ? "everyone's paid" : ""}
            </div>
          </Tile>
        </div>
        {shortfall > 0 && (
          <p className="border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            Custom amounts only add up to {formatMoney(s.totalDueCents)}, so the squad is {formatMoney(shortfall)} short of the league fee. Add
            full or half members, or raise a custom amount.
          </p>
        )}
        {shortfall < 0 && (
          <p className="text-xs text-muted">
            {s.customTotalCents > leagueFeeCents!
              ? `Custom amounts add up to ${formatMoney(s.customTotalCents)}, more than the league fee, so full and half members owe nothing.`
              : `Shares are rounded up to the dollar, so the squad pays ${formatMoney(-shortfall)} more than the league fee.`}
          </p>
        )}
      </section>

      {/* ---------------- Squad ---------------- */}
      <section>
        <h2 className="font-display text-3xl">
          Squad <span className="text-muted">({s.memberCount})</span>
        </h2>
        <p className="mt-1 text-sm text-muted">
          {s.memberCount - halfCount - customCount} full · {halfCount} half · {customCount} custom
        </p>
        {squad.length ? (
          <ul className="mt-4 divide-y divide-border border border-border">
            <li className="hidden grid-cols-[minmax(0,1fr)_4.5rem_5rem_5rem_7rem_3rem_3.5rem] gap-x-4 bg-background-alt px-4 py-2 text-[11px] uppercase tracking-wide text-muted sm:grid">
              <span>Player</span>
              <span>Fee</span>
              <span className="text-right">Due</span>
              <span className="text-right">Paid</span>
              <span className="text-right">Status</span>
              <span className="text-right">Apps</span>
              <span />
            </li>
            {squad.map((m) => (
              <MemberRow key={m.playerId} competitionId={competition.id} member={m} feeSet={feeSet} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Nobody yet. Add the players who&apos;ve signed up below.</p>
        )}

        <details open={!squad.length} className="mt-6 border border-border p-5">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide hover:text-accent">+ Add players</summary>
          <div className="mt-5 space-y-8">
            <AddMembersForm competitionId={competition.id} players={data.addablePlayers} />
            <CopySquadForm competitionId={competition.id} sources={data.copySources} />
          </div>
        </details>
      </section>

      {/* ---------------- Payments ---------------- */}
      {squad.length > 0 && (
        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">Record a payment</h2>
            <div className="mt-4">
              <PaymentForm competitionId={competition.id} squad={squad} />
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl">
              Payment log <span className="text-muted">({payments.length})</span>
            </h2>
            {payments.length ? (
              <ul className="mt-4 divide-y divide-border border border-border">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <span className="w-24 shrink-0 text-muted">{formatDate(p.paid_on)}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {p.name}
                      {(p.method || p.note) && <span className="text-xs text-muted"> · {[p.method, p.note].filter(Boolean).join(" · ")}</span>}
                    </span>
                    <span className={`shrink-0 font-semibold ${p.amount_cents < 0 ? "text-red-400" : ""}`}>{formatMoney(p.amount_cents)}</span>
                    <DeletePaymentButton id={p.id} label={`${p.name}'s ${formatMoney(p.amount_cents)} payment`} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">No payments yet.</p>
            )}
          </div>
        </section>
      )}

      {/* ---------------- Played without being in the squad ---------------- */}
      <section>
        <h2 className="font-display text-3xl">Played, not in squad</h2>
        <p className="mt-1 text-sm text-muted">From the lineups of this competition&apos;s results: club members from other squads and guests.</p>
        {nonSquad.length ? (
          <ul className="mt-4 divide-y divide-border border border-border">
            {nonSquad.map((p) => (
              <li key={p.playerId ?? `guest-${p.name}`} className="flex items-center gap-4 px-4 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {p.name}
                  <span className="ml-2 text-xs uppercase tracking-wide text-muted">{p.playerId ? "club player" : "guest"}</span>
                </span>
                <span className="shrink-0 text-muted">
                  {p.appearances} app{p.appearances === 1 ? "" : "s"}
                </span>
                {p.playerId && <QuickAddButton competitionId={competition.id} playerId={p.playerId} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Nobody outside the squad has played yet.</p>
        )}
      </section>
    </div>
  );
}
