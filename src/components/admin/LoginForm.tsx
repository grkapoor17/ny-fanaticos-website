"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { FormError, SubmitButton, inputClasses, labelClasses } from "./ui";

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, undefined);
  return (
    <form action={formAction} className="space-y-5">
      <label className="block space-y-2">
        <span className={labelClasses}>Email</span>
        <input name="email" type="email" autoComplete="email" required className={inputClasses} />
      </label>
      <label className="block space-y-2">
        <span className={labelClasses}>Password</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClasses} />
      </label>
      <FormError message={state?.error} />
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
