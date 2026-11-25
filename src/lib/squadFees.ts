/**
 * How a competition's league fee is split across its squad.
 *
 * Custom amounts come off the top; whatever is left is split into shares,
 * where a full member takes 1 share and a half member ½. The full share is
 * rounded UP to the whole dollar (easier to Venmo), so the squad may collect
 * a few dollars more than the fee.
 */

export type FeeType = "full" | "half" | "custom";
export const FEE_TYPES: { value: FeeType; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "half", label: "Half" },
  { value: "custom", label: "Custom" },
];
export const DEFAULT_LEAGUE_FEE_CENTS = 1600_00;
export const PAYMENT_METHODS = ["Venmo", "Zelle", "Cash", "Other"];

export type MemberFee = { player_id: string; fee_type: FeeType; custom_fee_cents: number | null };
export type Payment = { player_id: string; amount_cents: number };

export type Shares = {
  fullShareCents: number;
  halfShareCents: number;
  /** Full members + ½ × half members. */
  shareUnits: number;
  customTotalCents: number;
};

export function computeShares(leagueFeeCents: number, members: MemberFee[]): Shares {
  const customTotalCents = members.reduce((s, m) => s + (m.fee_type === "custom" ? m.custom_fee_cents ?? 0 : 0), 0);
  const shareUnits = members.reduce((s, m) => s + (m.fee_type === "full" ? 1 : m.fee_type === "half" ? 0.5 : 0), 0);
  const toSplit = Math.max(0, leagueFeeCents - customTotalCents);
  const fullShareCents = shareUnits > 0 ? Math.ceil(toSplit / shareUnits / 100) * 100 : 0;
  return { fullShareCents, halfShareCents: Math.round(fullShareCents / 2), shareUnits, customTotalCents };
}

export function amountDue(member: MemberFee, shares: Shares): number {
  if (member.fee_type === "custom") return member.custom_fee_cents ?? 0;
  return member.fee_type === "half" ? shares.halfShareCents : shares.fullShareCents;
}

export type SquadSummary = Shares & {
  leagueFeeCents: number;
  totalDueCents: number;
  collectedCents: number;
  /** Still owed by people who haven't paid in full (ignores overpayments). */
  outstandingCents: number;
  owingCount: number;
  memberCount: number;
};

export function summarise(leagueFeeCents: number, members: MemberFee[], payments: Payment[]): SquadSummary {
  const shares = computeShares(leagueFeeCents, members);
  const paid = paidByPlayer(payments);
  let totalDueCents = 0;
  let outstandingCents = 0;
  let owingCount = 0;
  for (const m of members) {
    const due = amountDue(m, shares);
    const balance = due - (paid.get(m.player_id) ?? 0);
    totalDueCents += due;
    if (balance > 0) {
      outstandingCents += balance;
      owingCount++;
    }
  }
  return {
    ...shares,
    leagueFeeCents,
    totalDueCents,
    collectedCents: payments.reduce((s, p) => s + p.amount_cents, 0),
    outstandingCents,
    owingCount,
    memberCount: members.length,
  };
}

export function paidByPlayer(payments: Payment[]): Map<string, number> {
  const paid = new Map<string, number>();
  for (const p of payments) paid.set(p.player_id, (paid.get(p.player_id) ?? 0) + p.amount_cents);
  return paid;
}

/** "$1,600" or "$106.50". */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toLocaleString("en-US", {
    minimumFractionDigits: abs % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Parses "1600", "$1,600.50", "-20" into cents, or null if it isn't a sensible amount. */
export function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned) * 100);
  return Math.abs(cents) <= 100_000_00 ? cents : null;
}
