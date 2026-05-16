"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import clsx from "clsx";
import { toggleLikeAction, toggleBookmarkAction } from "@/actions/posts";

type Props = {
  postId: string;
  liked: boolean;
  bookmarked: boolean;
  likes: number;
  replies: number;
  onReply?: () => void;
};

export function PostActions({ postId, liked, bookmarked, likes, replies, onReply }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function fire(action: (fd: FormData) => Promise<unknown>) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isPending) return;
      const fd = new FormData();
      fd.set("postId", postId);
      startTransition(async () => {
        await action(fd);
        router.refresh();
      });
    };
  }

  return (
    <div className="flex items-center justify-between max-w-md mt-1 -ml-2 text-muted">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReply?.();
        }}
        className="group flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-accent/10 hover:text-accent transition"
        aria-label="Responder"
      >
        <MessageCircle className="w-[18px] h-[18px]" />
        <span className="text-sm">{replies > 0 ? replies : ""}</span>
      </button>

      <button
        type="button"
        onClick={fire(toggleLikeAction)}
        className={clsx(
          "group flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-like/10 hover:text-like transition",
          liked && "text-like",
        )}
        aria-label="Curtir"
      >
        <Heart className={clsx("w-[18px] h-[18px]", liked && "fill-current")} />
        <span className="text-sm">{likes > 0 ? likes : ""}</span>
      </button>

      <button
        type="button"
        onClick={fire(toggleBookmarkAction)}
        className={clsx(
          "group flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-accent/10 hover:text-accent transition",
          bookmarked && "text-accent",
        )}
        aria-label="Salvar"
      >
        <Bookmark className={clsx("w-[18px] h-[18px]", bookmarked && "fill-current")} />
      </button>
    </div>
  );
}
