"use client";

import { useState, useTransition } from "react";
import { Radio } from "lucide-react";
import { createSpaceAction } from "@/actions/spaces";

export function CreateSpace() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set("title", title);
    setError(null);
    startTransition(async () => {
      const res = await createSpaceAction(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 p-4 border-b border-border">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Sobre o que é o seu Space?</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Ex: Bate-papo sobre Next.js"
          className="bg-transparent border border-border focus:border-accent rounded-md px-4 py-3 outline-none text-[15px]"
        />
      </label>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="self-start bg-accent hover:bg-accentHover text-white font-bold rounded-full px-5 h-10 flex items-center gap-2 disabled:opacity-50 transition"
      >
        <Radio className="w-5 h-5" />
        {isPending ? "Iniciando..." : "Iniciar Space"}
      </button>
    </form>
  );
}
