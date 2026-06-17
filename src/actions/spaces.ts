"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { RoomServiceClient } from "livekit-server-sdk";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const TitleSchema = z.string().trim().min(1, "Dê um título ao Space").max(120);

export async function createSpaceAction(formData: FormData) {
  const user = await requireUser();
  const parsed = TitleSchema.safeParse(formData.get("title"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const space = await prisma.space.create({
    data: {
      title: parsed.data,
      hostId: user.id,
      participants: { create: { userId: user.id, role: "HOST" } },
    },
    select: { id: true },
  });

  // Notifica os seguidores do host
  const followers = await prisma.follow.findMany({
    where: { followingId: user.id },
    select: { followerId: true },
  });

  if (followers.length > 0) {
    await prisma.notification.createMany({
      data: followers.map((f) => ({
        userId: f.followerId,
        actorId: user.id,
        type: "SPACE",
        spaceId: space.id,
      })),
    });
  }

  revalidatePath("/spaces");
  revalidatePath("/", "layout");
  redirect(`/spaces/${space.id}`);
}

export async function endSpaceAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const space = await prisma.space.findUnique({ where: { id }, select: { hostId: true } });
  if (!space || space.hostId !== user.id) return;

  await prisma.space.update({
    where: { id },
    data: { status: "ENDED", endedAt: new Date() },
  });

  // Best-effort: derruba a sala no LiveKit pra desconectar todos os ouvintes.
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (key && secret && wsUrl) {
    const httpUrl = wsUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
    try {
      await new RoomServiceClient(httpUrl, key, secret).deleteRoom(id);
    } catch {
      // sala pode nem ter sido criada ainda; ignorar
    }
  }

  revalidatePath("/spaces");
  redirect("/spaces");
}
