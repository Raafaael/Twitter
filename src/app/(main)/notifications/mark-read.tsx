"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsReadAction } from "@/actions/notifications";

/**
 * Marca as notificações como lidas ao abrir a página e atualiza o layout
 * (some com a bolinha da sidebar na hora). Só dispara se houver não lidas.
 */
export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (!hasUnread || done.current) return;
    done.current = true;
    (async () => {
      await markNotificationsReadAction();
      router.refresh();
    })();
  }, [hasUnread, router]);

  return null;
}
