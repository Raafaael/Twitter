import Link from "next/link";
import { LoginForm } from "./login-form";
import { OAuthButtons } from "@/components/oauth-buttons";

type Search = Promise<{ oauth?: string }>;

function mapOauthError(code?: string): string | null {
  if (!code) return null;
  switch (code) {
    case "denied":
      return "Autorização cancelada.";
    case "banned":
      return "Esta conta foi suspensa.";
    case "config":
      return "OAuth não está configurado no servidor.";
    case "state":
    case "invalid":
      return "Sessão expirou. Tente novamente.";
    case "token":
    case "userinfo":
      return "Falha ao conectar com o Google.";
    case "noemail":
      return "Sua conta Google não tem e-mail verificado.";
    default:
      return "Erro no login com Google.";
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Search }) {
  const { oauth } = await searchParams;
  const oauthError = mapOauthError(oauth);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8">Entre no X</h1>
        {oauthError && (
          <p className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-sm rounded-md">
            {oauthError}
          </p>
        )}
        <LoginForm />
        <OAuthButtons />
        <p className="text-muted mt-8 text-center">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-accent hover:underline font-semibold">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
