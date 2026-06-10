import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PasswordForm } from "./password-form";
import { StepDots } from "@/components/step-dots";

type Search = Promise<{ email?: string }>;

export default async function PasswordPage({ searchParams }: { searchParams: Search }) {
  const { email } = await searchParams;
  if (!email) redirect("/register");

  const row = await prisma.emailVerification.findUnique({ where: { email } });
  if (!row) redirect("/register");
  if (!row.verifiedAt) redirect(`/register/verify?email=${encodeURIComponent(email)}`);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Crie uma senha</h1>
        <StepDots current={3} total={3} />
        <p className="text-muted mb-8 mt-2">
          Tudo certo, <strong className="text-text">{row.name}</strong>. Só falta uma senha segura.
        </p>
        <PasswordForm email={email} />
      </div>
    </div>
  );
}
