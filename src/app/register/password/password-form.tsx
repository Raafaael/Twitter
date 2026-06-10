"use client";

import { useActionState } from "react";
import { completeRegistrationAction } from "@/actions/registration";

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(completeRegistrationAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="email" value={email} />
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Senha</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
        <span className="text-muted text-xs">Mínimo 6 caracteres.</span>
      </label>
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-text text-black font-bold rounded-full h-12 hover:bg-text/90 disabled:opacity-50 transition mt-2"
      >
        {pending ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
