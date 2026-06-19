"use client";

import { useEffect, useState } from "react";

const POLL_MS = 15000;

/**
 * Bolinha de notificação na sidebar. Começa com o valor renderizado no servidor
 * e faz polling leve (só um count) a cada 15s para refletir notificações novas
 * sem o usuário precisar recarregar a página.
 */
export function NotificationBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  // Sincroniza quando o servidor manda um novo valor (ex: após marcar como lida).
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (active) setCount(data.count ?? 0);
      } catch {
        // rede instável: ignora e tenta de novo no próximo ciclo
      }
    }

    const id = setInterval(check, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full" aria-label="Notificações não lidas" />
  );
}
