"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const ContentSchema = z.string().trim().min(1, "Escreva algo").max(280, "Máximo 280 caracteres");

export async function createPostAction(formData: FormData) {
  const user = await requireUser();
  const parsed = ContentSchema.safeParse(formData.get("content"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const parentId = (formData.get("parentId") as string | null) || null;
  if (parentId) {
    const parent = await prisma.post.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!parent) return { error: "Postagem original não encontrada" };
  }

  await prisma.post.create({
    data: { authorId: user.id, content: parsed.data, parentId },
  });

  revalidatePath("/");
  if (parentId) revalidatePath(`/post/${parentId}`);
  return { ok: true };
}

export async function editPostAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = ContentSchema.safeParse(formData.get("content"));
  if (!id) return { error: "id ausente" };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, parentId: true } });
  if (!post) return { error: "Postagem não encontrada" };
  if (post.authorId !== user.id) return { error: "Sem permissão" };

  await prisma.post.update({
    where: { id },
    data: { content: parsed.data, edited: true },
  });

  revalidatePath("/");
  revalidatePath(`/post/${id}`);
  if (post.parentId) revalidatePath(`/post/${post.parentId}`);
  return { ok: true };
}

export async function deletePostAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post || post.authorId !== user.id) return;

  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
}

export async function toggleLikeAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId: user.id, postId } } });
  } else {
    await prisma.like.create({ data: { userId: user.id, postId } });
  }
  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
}

export async function toggleBookmarkAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) {
    await prisma.bookmark.delete({ where: { userId_postId: { userId: user.id, postId } } });
  } else {
    await prisma.bookmark.create({ data: { userId: user.id, postId } });
  }
  revalidatePath("/");
  revalidatePath("/bookmarks");
  revalidatePath(`/post/${postId}`);
}
