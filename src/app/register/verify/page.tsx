import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { VerifyForm } from "./verify-form";
import { StepDots } from "@/components/step-dots";

type Search = Promise<{ email?: string; expired?: string }>;

export default async function VerifyPage({ searchParams }: { searchParams: Search }) {
  const { email, expired } = await searchParams;
  if (!email) redirect("/register");

  const row = await prisma.emailVerification.findUnique({ where: { email } });
  if (!row) redirect("/register");
  if (row.verifiedAt) redirect(`/register/password?email=${encodeURIComponent(email)}`);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Confirme seu e-mail</h1>
        <StepDots current={2} total={3} />

        {expired && (
          <p className="mt-4 p-3 border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-sm rounded-md">
            O link anterior expirou. Enviamos um novo e-mail com código e link atualizados.
          </p>
        )}

        <p className="text-muted mb-8 mt-2">
          Enviamos um código de 6 dígitos para <strong className="text-text">{email}</strong>.
          Digite-o abaixo <strong className="text-text">ou</strong> clique no link do e-mail para
          confirmar.
        </p>
        <VerifyForm email={email} />
        <p className="text-muted mt-8 text-center text-sm">
          Errei o e-mail?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Voltar
          </Link>
        </p>
      </div>
    </div>
  );
}
