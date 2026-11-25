"use client";

import { useFormStatus } from "react-dom";

export const inputClasses =
  "w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export const labelClasses = "text-xs uppercase tracking-[0.15em] text-muted";

export function SubmitButton({ children, pendingLabel = "Saving…", variant = "primary" }: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger" | "quiet";
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-accent text-background hover:opacity-90",
    danger: "border border-red-500/60 text-red-400 hover:bg-red-500/10",
    quiet: "border border-border text-foreground/80 hover:border-accent hover:text-accent",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-5 py-3 text-sm font-semibold uppercase tracking-wide transition disabled:cursor-wait disabled:opacity-60 ${styles}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </p>
  );
}
