"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const Schema = z.string().trim().min(1).max(2000);

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  const receiverId = String(formData.get("receiverId") ?? "");
  const parsed = Schema.safeParse(formData.get("content"));
  if (!receiverId || receiverId === user.id || !parsed.success) return;

  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
  if (!receiver) return;

  await prisma.message.create({
    data: { senderId: user.id, receiverId, content: parsed.data },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${receiverId}`);
}
