"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendMessageAction } from "@/actions/messages";

export function MessageComposer({ receiverId }: { receiverId: string }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const taRef = useRef<HTMLTextAreaElement>(null);

  function send() {
    if (!value.trim() || isPending) return;
    const fd = new FormData();
    fd.set("receiverId", receiverId);
    fd.set("content", value);
    setValue("");
    if (taRef.current) taRef.current.style.height = "auto";
    startTransition(async () => {
      await sendMessageAction(fd);
      router.refresh();
    });
  }

  function autoresize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="flex items-end gap-2 p-3 border-t border-border bg-bg"
    >
      <div className="flex-1 bg-panel rounded-2xl px-3 py-2">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            autoresize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Inicie uma nova mensagem"
          className="w-full bg-transparent outline-none text-[15px] resize-none placeholder:text-muted"
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim() || isPending}
        className="p-2 rounded-full text-accent hover:bg-accent/10 disabled:opacity-40 disabled:hover:bg-transparent transition"
        aria-label="Enviar"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
