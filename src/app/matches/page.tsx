import type { Metadata } from "next";
import PlaceholderImage from "@/components/PlaceholderImage";
import FixtureRow from "@/components/FixtureRow";
import MatchResult from "@/components/MatchResult";
import { images } from "@/data/images";
import { fixtures, results } from "@/data/matches";

export const metadata: Metadata = {
  title: "Matches",
  description: "Upcoming fixtures and recent results for NY Fanaticos.",
};

export default function MatchesPage() {
  const reversedResults = [...results].reverse();

  return (
    <>
      <section className="relative flex h-[46vh] min-h-[320px] items-end overflow-hidden">
        <PlaceholderImage asset={images.matchesHero} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <h1 className="font-display text-6xl sm:text-8xl">MATCHES</h1>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">Upcoming Fixtures</h2>
          <div className="mt-8 space-y-4">
            {fixtures.length > 0 ? (
              fixtures.map((m) => <FixtureRow key={m.id} match={m} />)
            ) : (
              <div className="border border-dashed border-border bg-background-alt p-10 text-center text-sm text-muted">
                No upcoming fixtures confirmed yet. Follow{" "}
                <a
                  href="https://instagram.com/nyfanaticos"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-accent"
                >
                  @nyfanaticos
                </a>{" "}
                for schedule updates.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background-alt">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">Results</h2>
          <div className="mt-8 space-y-4">
            {reversedResults.map((m) => (
              <MatchResult key={m.id} match={m} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
