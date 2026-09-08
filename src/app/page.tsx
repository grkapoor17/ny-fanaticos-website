import Link from "next/link";
import PlaceholderImage from "@/components/PlaceholderImage";
import MatchResult from "@/components/MatchResult";
import FixtureRow from "@/components/FixtureRow";
import PlayerCard from "@/components/PlayerCard";
import InstagramGrid from "@/components/InstagramGrid";
import { images } from "@/data/images";
import { results, fixtures as staticFixtures, byDateDesc } from "@/data/matches";
import { getSheetMatches } from "@/lib/sheetMatches";
import { competitions } from "@/data/competitions";
import { featuredPlayers } from "@/data/players";
import { primarySponsor } from "@/data/sponsors";
import { honours } from "@/data/honours";

const latestHonour = honours[0] ?? null;

export default async function Home() {
  const sheetMatches = await getSheetMatches();
  const allFixtures = [...staticFixtures, ...sheetMatches.filter((m) => m.status === "scheduled")].sort(
    (a, b) => -byDateDesc(a, b),
  );
  const allResults = [...results, ...sheetMatches.filter((m) => m.status === "final")].sort(byDateDesc);
  const nextMatch = allFixtures[0] ?? null;
  const latestResult = allResults[0] ?? null;

  return (
    <>
      {/* HERO */}
      <section className="relative flex h-[92vh] min-h-[640px] items-end overflow-hidden">
        <PlaceholderImage asset={images.heroHome} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">New York City</p>
          <h1 className="font-display mt-3 text-[16vw] leading-[0.85] tracking-tight sm:text-[10vw] lg:text-[8rem]">
            NY FANATICOS
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foreground/80 sm:text-xl">
            Football. New York City. Together.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <Link
              href="/matches"
              className="text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-accent"
            >
              View Matches →
            </Link>
            <Link
              href="/squad"
              className="text-sm font-semibold uppercase tracking-wide text-foreground/80 transition-colors hover:text-accent"
            >
              Meet the Squad →
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST RESULT / NEXT MATCH */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Latest Result</p>
              <div className="mt-4">
                {latestResult ? (
                  <MatchResult match={latestResult} />
                ) : (
                  <EmptyMatchState label="No results yet." />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Next Match</p>
              <div className="mt-4">
                {nextMatch ? (
                  <FixtureRow match={nextMatch} />
                ) : (
                  <EmptyMatchState label="No upcoming fixture confirmed yet. Follow @nyfanaticos for schedule updates." />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAMPIONS */}
      <section className="relative overflow-hidden border-t border-border">
        <PlaceholderImage asset={images.champions} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-32">
          {latestHonour && (
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              {latestHonour.season} {latestHonour.competition} Champions
            </p>
          )}
          <h2 className="font-display mt-3 text-5xl leading-[0.9] sm:text-7xl">CHAMPIONS.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80">
            From topping the league-stage group to navigating the knockout rounds, NY Fanaticos
            finished the campaign by lifting the trophy.
          </p>
        </div>
      </section>

      {/* CLUB INTRO */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl">BUILT IN NEW YORK.</h2>
            <p className="mt-6 text-lg text-foreground/80">
              NY Fanaticos started as a group of friends who wanted to play football. It has
              grown into a competitive NYC club playing multiple leagues, chasing trophies, and
              building something beyond matchday.
            </p>
            <p className="mt-4 text-lg text-foreground/80">
              We play to win, but the club has always been about the people around it.
            </p>
            <Link
              href="/club"
              className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-accent"
            >
              The Club →
            </Link>
          </div>
          <PlaceholderImage asset={images.clubIntro} className="aspect-[4/5] w-full" />
        </div>
      </section>

      {/* COMPETITIONS */}
      <section className="border-t border-border bg-background-alt">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-4xl sm:text-5xl">COMPETITIONS</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {competitions.map((c) => (
              <div key={c.id} className="border border-border bg-background p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl tracking-wide">{c.name}</h3>
                  <span className="text-sm text-muted">{c.season}</span>
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-accent">
                  {c.status}
                </p>
                <p className="mt-4 text-sm text-foreground/70">{c.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SQUAD PREVIEW */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl">THE SQUAD</h2>
            <Link href="/squad" className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-accent">
              View Full Squad →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featuredPlayers.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      </section>

      {/* SPONSOR */}
      {primarySponsor && (
        <section className="border-t border-border bg-background-alt">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Supported By</p>
                <h2 className="font-display mt-3 text-4xl sm:text-5xl">LYDIA&apos;S</h2>
                <p className="mt-6 max-w-lg text-lg text-foreground/80">{primarySponsor.description}</p>
                {primarySponsor.url ? (
                  <a
                    href={primarySponsor.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-accent"
                  >
                    Visit Lydia&apos;s →
                  </a>
                ) : (
                  <span className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-muted">
                    Visit Lydia&apos;s (link coming soon)
                  </span>
                )}
              </div>
              <PlaceholderImage asset={images.lydiasLogo} className="aspect-[16/9] w-full" />
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl sm:text-5xl">FOLLOW THE CLUB</h2>
            <a
              href="https://instagram.com/nyfanaticos"
              target="_blank"
              rel="noreferrer noopener"
              className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-accent"
            >
              @NYFANATICOS →
            </a>
          </div>
          <div className="mt-10">
            <InstagramGrid />
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyMatchState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center border border-dashed border-border bg-background-alt p-8 text-center text-sm text-muted">
      {label}
    </div>
  );
}
