import CompetitionForm from "@/components/admin/CompetitionForm";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function NewCompetitionPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("competitions").select("name");
  const knownNames = [...new Set((data ?? []).map((c) => c.name as string))].sort();

  return (
    <div>
      <h1 className="font-display text-5xl">Add competition</h1>
      <p className="mt-2 text-sm text-muted">A new season of an existing league counts as a new competition.</p>
      <div className="mt-8">
        <CompetitionForm
          knownNames={knownNames}
          initial={{ id: null, name: "", season: "", status: "Upcoming", summary: "", starts_on: null }}
        />
      </div>
    </div>
  );
}
