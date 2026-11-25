import Link from "next/link";
import { notFound } from "next/navigation";
import CompetitionForm, { DeleteCompetitionForm, type CompetitionFormValues } from "@/components/admin/CompetitionForm";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: competition }, { data: all }, { count }] = await Promise.all([
    supabase.from("competitions").select("id, name, season, status, summary, starts_on").eq("id", id).maybeSingle(),
    supabase.from("competitions").select("name"),
    supabase.from("matches").select("id", { count: "exact", head: true }).eq("competition_id", id),
  ]);
  if (!competition) notFound();
  const knownNames = [...new Set((all ?? []).map((c) => c.name as string))].sort();

  return (
    <div className="space-y-16">
      <div>
        <Link href="/admin/competitions" className="text-xs uppercase tracking-wide text-muted hover:text-foreground">
          ← Competitions
        </Link>
        <h1 className="mt-4 font-display text-5xl">
          {competition.name} <span className="text-muted">— {competition.season}</span>
        </h1>
        <div className="mt-8">
          <CompetitionForm initial={competition as CompetitionFormValues} knownNames={knownNames} />
        </div>
      </div>

      <section className="border-t border-border pt-10">
        <h2 className="font-display text-3xl text-red-400">Delete competition</h2>
        <div className="mt-4">
          {count ? (
            <p className="text-sm text-muted">
              {count} match{count === 1 ? "" : "es"} belong to this competition. Delete those first if you really want to remove it.
            </p>
          ) : (
            <DeleteCompetitionForm id={id} label={`${competition.name} — ${competition.season}`} />
          )}
        </div>
      </section>
    </div>
  );
}
