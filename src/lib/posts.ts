import { prisma } from "./db";
import type { PostCardData } from "@/components/post-card";

type PrismaPost = {
  id: string;
  content: string;
  createdAt: Date;
  edited: boolean;
  author: { id: string; name: string; username: string; avatarUrl: string | null };
  _count: { likes: number; replies: number };
  likes: { userId: string }[];
  bookmarks: { userId: string }[];
};

export function shapePost(p: PrismaPost, currentUserId: string): PostCardData {
  return {
    id: p.id,
    content: p.content,
    createdAt: p.createdAt.toISOString(),
    edited: p.edited,
    author: p.author,
    _count: p._count,
    liked: p.likes.some((l) => l.userId === currentUserId),
    bookmarked: p.bookmarks.some((b) => b.userId === currentUserId),
  };
}

export const postInclude = (currentUserId: string) => ({
  author: { select: { id: true, name: true, username: true, avatarUrl: true } },
  _count: { select: { likes: true, replies: true } },
  likes: { where: { userId: currentUserId }, select: { userId: true } },
  bookmarks: { where: { userId: currentUserId }, select: { userId: true } },
});
