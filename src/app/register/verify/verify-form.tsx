"use client";

import { useActionState } from "react";
import { resendCodeAction, verifyCodeAction } from "@/actions/registration";

export function VerifyForm({ email }: { email: string }) {
  const [verifyState, verifyAction, verifying] = useActionState(verifyCodeAction, undefined);
  const [resendState, resendAction, resending] = useActionState(resendCodeAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <form action={verifyAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Código</span>
          <input
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            placeholder="000000"
            className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-2xl text-center tracking-[0.5em] font-mono"
          />
        </label>
        {verifyState?.error && <p className="text-red-500 text-sm">{verifyState.error}</p>}
        <button
          type="submit"
          disabled={verifying}
          className="bg-text text-black font-bold rounded-full h-12 hover:bg-text/90 disabled:opacity-50 transition mt-2"
        >
          {verifying ? "Verificando..." : "Verificar"}
        </button>
      </form>

      <form action={resendAction} className="text-center">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={resending}
          className="text-accent hover:underline text-sm disabled:opacity-50"
        >
          {resending ? "Reenviando..." : "Reenviar código"}
        </button>
        {resendState?.error && (
          <p className="text-red-500 text-sm mt-2">{resendState.error}</p>
        )}
        {resendState?.ok && !resending && (
          <p className="text-green-500 text-sm mt-2">Código reenviado.</p>
        )}
      </form>
    </div>
  );
}
