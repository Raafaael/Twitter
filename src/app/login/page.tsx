import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8">Entre no X</h1>
        <LoginForm />
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
