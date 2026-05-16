"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "./avatar";
import { PostActions } from "./post-actions";
import { timeAgo } from "@/lib/format";
import { deletePostAction, editPostAction } from "@/actions/posts";

export type PostCardData = {
  id: string;
  content: string;
  createdAt: string;
  edited: boolean;
  author: { id: string; name: string; username: string; avatarUrl?: string | null };
  _count: { likes: number; replies: number };
  liked: boolean;
  bookmarked: boolean;
};

type Props = {
  post: PostCardData;
  currentUserId: string;
};

export function PostCard({ post, currentUserId }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = post.author.id === currentUserId;
  const detailHref = `/post/${post.id}`;

  function go(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a,button,form,textarea")) return;
    router.push(detailHref);
  }

  function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || draft.length > 280) return;
    const fd = new FormData();
    fd.set("id", post.id);
    fd.set("content", draft);
    setError(null);
    startTransition(async () => {
      const res = await editPostAction(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function onDelete() {
    const fd = new FormData();
    fd.set("id", post.id);
    startTransition(async () => {
      await deletePostAction(fd);
      router.refresh();
    });
  }

  return (
    <article
      onClick={go}
      className="flex gap-3 px-4 py-3 border-b border-border hover:bg-white/[0.02] cursor-pointer transition"
    >
      <Link href={`/${post.author.username}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <Avatar name={post.author.name} src={post.author.avatarUrl} />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[15px]">
          <Link
            href={`/${post.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold hover:underline truncate"
          >
            {post.author.name}
          </Link>
          <span className="text-muted truncate">@{post.author.username}</span>
          <span className="text-muted">·</span>
          <Link
            href={detailHref}
            onClick={(e) => e.stopPropagation()}
            className="text-muted hover:underline shrink-0"
          >
            {timeAgo(post.createdAt)}
          </Link>
          {post.edited && <span className="text-muted text-xs">(editado)</span>}

          {isOwner && (
            <div className="ml-auto relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="p-1.5 rounded-full hover:bg-accent/10 hover:text-accent text-muted transition"
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-8 z-20 bg-bg border border-border rounded-xl shadow-2xl min-w-[180px] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditing(true);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[15px]"
                  >
                    <Pencil className="w-5 h-5" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[15px] text-red-500"
                  >
                    <Trash2 className="w-5 h-5" /> Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <form onClick={(e) => e.stopPropagation()} onSubmit={onSaveEdit} className="mt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-transparent border border-border rounded-xl p-3 text-[15px] outline-none focus:border-accent"
              rows={3}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(post.content);
                  setEditing(false);
                  setError(null);
                }}
                className="px-4 h-9 rounded-full border border-border text-sm font-bold hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !draft.trim()}
                className="px-4 h-9 rounded-full bg-accent hover:bg-accentHover text-white text-sm font-bold disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </form>
        ) : (
          <p className="text-[15px] whitespace-pre-wrap break-words mt-0.5">{post.content}</p>
        )}

        <PostActions
          postId={post.id}
          liked={post.liked}
          bookmarked={post.bookmarked}
          likes={post._count.likes}
          replies={post._count.replies}
          onReply={() => router.push(detailHref)}
        />
      </div>
    </article>
  );
}
