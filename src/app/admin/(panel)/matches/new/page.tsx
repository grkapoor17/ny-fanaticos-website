import MatchForm from "@/components/admin/MatchForm";
import { getMatchFormOptions } from "@/lib/adminData";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function NewMatchPage() {
  const { supabase } = await requireAdmin();
  const options = await getMatchFormOptions(supabase);

  return (
    <div>
      <h1 className="font-display text-5xl">Add fixture</h1>
      <p className="mt-2 text-sm text-muted">
        Add it as Upcoming now, then come back after the game to enter the result. Or switch to Played to log a result
        straight away.
      </p>
      <div className="mt-8">
        <MatchForm
          {...options}
          initialLineup={[]}
          initial={{
            id: null,
            competition_id: options.competitions[0]?.id ?? "",
            stage: "Regular Season",
            match_date: null,
            kickoff: null,
            venue: null,
            opponent: "",
            home_away: null,
            our_score: null,
            opponent_score: null,
            pens_for: null,
            pens_against: null,
            status: "scheduled",
            forfeit: false,
            note: null,
          }}
        />
      </div>
    </div>
  );
}
