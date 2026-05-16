"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function toggleFollowAction(formData: FormData) {
  const user = await requireUser();
  const targetId = String(formData.get("targetId") ?? "");
  if (!targetId || targetId === user.id) return;

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
  });
  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
    });
  } else {
    await prisma.follow.create({ data: { followerId: user.id, followingId: targetId } });
  }

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { username: true } });
  revalidatePath("/");
  if (target) revalidatePath(`/${target.username}`);
}
