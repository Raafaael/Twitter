export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 my-2">
        <span className="flex-1 h-px bg-border" />
        <span className="text-muted text-xs uppercase tracking-wider">ou</span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <a
        href="/api/auth/google/start"
        className="flex items-center justify-center gap-3 border border-border hover:bg-white/5 rounded-full h-12 font-semibold transition"
      >
        Continuar com Google
      </a>
    </div>
  );
}
