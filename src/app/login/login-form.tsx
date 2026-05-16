"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">E-mail ou usuário</span>
        <input
          name="identifier"
          required
          autoComplete="username"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
      </label>

      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-text text-black font-bold rounded-full h-12 hover:bg-text/90 disabled:opacity-50 transition mt-2"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
