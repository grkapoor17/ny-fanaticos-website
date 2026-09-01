import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-2xl tracking-wide text-foreground">NY FANATICOS</div>
            <p className="mt-2 text-sm text-muted">New York City</p>
            <a
              href="https://instagram.com/nyfanaticos"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-block text-sm uppercase tracking-wide text-accent"
            >
              @nyfanaticos →
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Club</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/matches" className="text-foreground/80 hover:text-foreground">Matches</Link></li>
              <li><Link href="/squad" className="text-foreground/80 hover:text-foreground">Squad</Link></li>
              <li><Link href="/club" className="text-foreground/80 hover:text-foreground">Club</Link></li>
              <li><Link href="/join" className="text-foreground/80 hover:text-foreground">Join</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Partners</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/sponsors" className="text-foreground/80 hover:text-foreground">Sponsors</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Supported by</div>
            <p className="mt-3 text-sm text-foreground/80">Lydia&apos;s NYC</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 NY Fanaticos</p>
          <p>New York City Football Club</p>
        </div>
      </div>
    </footer>
  );
}
