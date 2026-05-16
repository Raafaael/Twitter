import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Crie sua conta</h1>
        <p className="text-muted mb-8">É rápido e simples.</p>
        <RegisterForm />
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
