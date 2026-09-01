import type { Metadata } from "next";
import PlaceholderImage from "@/components/PlaceholderImage";
import JoinForm from "@/components/JoinForm";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Join",
  description: "Play for NY Fanaticos — an NYC football club based in Manhattan and Brooklyn.",
};

export default function JoinPage() {
  return (
    <>
      <section className="relative flex h-[46vh] min-h-[320px] items-end overflow-hidden">
        <PlaceholderImage asset={images.joinHero} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <h1 className="font-display text-6xl sm:text-8xl">PLAY FOR NY FANATICOS</h1>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-lg text-foreground/80">
            We&apos;re always interested in meeting quality players who want to compete, improve,
            and be part of the club.
          </p>
          <p className="mt-4 text-sm text-muted">
            NY Fanaticos is based in NYC and primarily plays in Manhattan and Brooklyn. Submitting
            this form doesn&apos;t guarantee a roster spot — we&apos;ll follow up if there&apos;s a fit.
          </p>

          <div className="mt-12">
            <JoinForm />
          </div>
        </div>
      </section>
    </>
  );
}
