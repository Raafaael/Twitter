"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-border flex items-center gap-6 px-4 h-14">
      <button
        type="button"
        onClick={() => router.back()}
        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-muted text-[13px] truncate">{subtitle}</p>}
      </div>
    </header>
  );
}
