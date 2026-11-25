/** Competitions live in Supabase (table `competitions`), loaded by src/lib/clubData.ts. */
export type Competition = {
  id: string;
  name: string;
  season: string;
  status: string;
  summary: string;
};
