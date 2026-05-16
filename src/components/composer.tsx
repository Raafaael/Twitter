"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./avatar";
import { createPostAction } from "@/actions/posts";

type Props = {
  user: { name: string; avatarUrl?: string | null };
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

export function Composer({ user, parentId, placeholder, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const taRef = useRef<HTMLTextAreaElement>(null);

  const remaining = 280 - value.length;
  const canPost = value.trim().length > 0 && value.length <= 280 && !isPending;

  function autoresize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canPost) return;
    const fd = new FormData();
    fd.set("content", value);
    if (parentId) fd.set("parentId", parentId);
    setError(null);
    startTransition(async () => {
      const res = await createPostAction(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setValue("");
      if (taRef.current) taRef.current.style.height = "auto";
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-3 px-4 py-3 border-b border-border"
    >
      <Avatar name={user.name} src={user.avatarUrl} />
      <div className="flex-1 min-w-0">
        <textarea
          ref={taRef}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            autoresize();
          }}
          rows={1}
          placeholder={placeholder ?? (parentId ? "Poste sua resposta" : "O que está acontecendo?")}
          className="w-full bg-transparent text-xl placeholder:text-muted outline-none pt-2"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="flex items-center justify-end gap-3 pt-2 mt-2 border-t border-border">
          <span
            className={`text-sm ${
              remaining < 0 ? "text-red-500" : remaining < 20 ? "text-yellow-500" : "text-muted"
            }`}
          >
            {remaining}
          </span>
          <button
            type="submit"
            disabled={!canPost}
            className="bg-accent hover:bg-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full px-5 h-9 transition"
          >
            {parentId ? "Responder" : "Postar"}
          </button>
        </div>
      </div>
    </form>
  );
}
