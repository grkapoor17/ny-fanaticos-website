import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/supabaseServer";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <section className="mx-auto max-w-md px-5 pb-24 pt-32 sm:px-8">
      <h1 className="font-display text-5xl">Admin</h1>
      <p className="mt-2 text-sm text-muted">Sign in to manage the squad and matches.</p>
      <div className="mt-10">
        <LoginForm />
      </div>
    </section>
  );
}
