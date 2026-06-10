"use client";

import { useActionState } from "react";
import { startRegistrationAction } from "@/actions/registration";

export function RegisterForm() {
  const [state, action, pending] = useActionState(startRegistrationAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Nome</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Usuário</span>
        <input
          name="username"
          required
          autoComplete="username"
          pattern="[a-zA-Z0-9_]{3,20}"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
      </label>

      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-text text-black font-bold rounded-full h-12 hover:bg-text/90 disabled:opacity-50 transition mt-2"
      >
        {pending ? "Enviando código..." : "Enviar código"}
      </button>
    </form>
  );
}
