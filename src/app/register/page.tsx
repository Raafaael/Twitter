import Link from "next/link";
import { RegisterForm } from "./register-form";
import { StepDots } from "@/components/step-dots";
import { OAuthButtons } from "@/components/oauth-buttons";

type Search = Promise<{ confirm?: string }>;

export default async function RegisterPage({ searchParams }: { searchParams: Search }) {
  const { confirm } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Crie sua conta</h1>
        <StepDots current={1} total={3} />
        {confirm === "invalid" && (
          <p className="mt-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm rounded-md">
            Link de confirmação inválido ou já utilizado. Recomece o cadastro abaixo.
          </p>
        )}
        <p className="text-muted mb-8 mt-2">Vamos começar pelos seus dados.</p>
        <RegisterForm />
        <OAuthButtons />
        <p className="text-muted mt-8 text-center">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
