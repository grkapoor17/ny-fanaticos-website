import type { Match, Scorer } from "@/data/matches";

/**
 * Live Fall 2026 fixtures/results, sourced from the team's Google Sheet
 * (one tab per match, named "Match 1", "Match 2", ...). The sheet is the
 * source of truth for this season: fixture details are entered as soon as
 * they're known, then filled in with the score and player stats after the
 * match. Cell positions below match the sheet's fixed per-match template —
 * see that sheet's "Match 1" tab for the layout if this ever needs updating.
 *
 * The sheet must stay shared as "Anyone with the link – Viewer" so the API
 * key (read-only, restricted to the Sheets API) can read it.
 */

const SPREADSHEET_ID = "1coVf_FnAnS0xSz6y7sbnmRWh8jmzc50KopjqGGWU_RA";
const COMPETITION = "Bowery Premier League D4";
const SEASON = "2026 Fall";
const STAGE = "Regular Season";

const REVALIDATE_SECONDS = 60; // TEMP: 1 min for testing, revert to 60 * 60 * 24 once verified

type SheetRow = (string | undefined)[];

function cell(row: SheetRow | undefined, index: number): string | null {
  const value = row?.[index];
  return value && value.trim() !== "" ? value.trim() : null;
}

function parseMatchTab(title: string, values: SheetRow[]): Match | null {
  const date = cell(values[1], 2);
  const opponent = cell(values[1], 5);
  if (!date || !opponent) return null; // fixture not confirmed yet

  const notes = cell(values[1], 7);
  const goalsForRaw = cell(values[2], 2);
  const goalsAgainstRaw = cell(values[2], 5);
  const venue = cell(values[2], 8);
  const time = cell(values[2], 10);

  const goalsFor = goalsForRaw !== null ? Number(goalsForRaw) : null;
  const goalsAgainst = goalsAgainstRaw !== null ? Number(goalsAgainstRaw) : null;
  const isFinal = goalsFor !== null && goalsAgainst !== null && !Number.isNaN(goalsFor) && !Number.isNaN(goalsAgainst);

  const lineup: string[] = [];
  const scorers: Scorer[] = [];
  for (let i = 7; i <= 21; i++) {
    const name = cell(values[i], 1);
    if (!name) continue;
    lineup.push(name);
    const goals = Number(cell(values[i], 2));
    if (Number.isFinite(goals) && goals > 0) {
      scorers.push({ name, goals });
    }
  }

  const matchNumber = title.replace(/[^0-9]/g, "") || "0";

  return {
    id: `bowery-fall-${matchNumber}`,
    competition: COMPETITION,
    stage: STAGE,
    season: SEASON,
    date,
    time,
    venue,
    opponent,
    homeAway: null,
    nyFanaticosScore: isFinal ? goalsFor : null,
    opponentScore: isFinal ? goalsAgainst : null,
    penaltiesFor: null,
    penaltiesAgainst: null,
    status: isFinal ? "final" : "scheduled",
    note: notes ?? undefined,
    lineup,
    scorers,
  };
}

export async function getSheetMatches(): Promise<Match[]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey) return [];

  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${apiKey}&fields=sheets.properties.title`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!metaRes.ok) return [];
    const meta: { sheets?: { properties: { title: string } }[] } = await metaRes.json();

    const matchTitles = (meta.sheets ?? [])
      .map((s) => s.properties.title)
      .filter((title) => /^Match \d+$/.test(title))
      .sort((a, b) => Number(a.replace(/[^0-9]/g, "")) - Number(b.replace(/[^0-9]/g, "")));

    if (matchTitles.length === 0) return [];

    const ranges = matchTitles.map((title) => `ranges=${encodeURIComponent(`'${title}'!A1:K23`)}`).join("&");
    const valuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?key=${apiKey}&${ranges}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!valuesRes.ok) return [];
    const data: { valueRanges?: { values?: SheetRow[] }[] } = await valuesRes.json();

    const matches: Match[] = [];
    matchTitles.forEach((title, i) => {
      const values = data.valueRanges?.[i]?.values ?? [];
      const match = parseMatchTab(title, values);
      if (match) matches.push(match);
    });
    return matches;
  } catch {
    return [];
  }
}
