import { byDateDesc, fixtures as staticFixtures, results as staticResults, type Match } from "@/data/matches";
import { getSheetMatches } from "@/lib/sheetMatches";

export type AllMatches = {
  /** Upcoming, soonest first. */
  fixtures: Match[];
  /** Completed, most recent first. */
  results: Match[];
};

export async function getAllMatches(): Promise<AllMatches> {
  const sheetMatches = await getSheetMatches();
  const fixtures = [...staticFixtures, ...sheetMatches.filter((m) => m.status === "scheduled")].sort(
    (a, b) => -byDateDesc(a, b),
  );
  const results = [...staticResults, ...sheetMatches.filter((m) => m.status === "final")].sort(byDateDesc);
  return { fixtures, results };
}
