import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const spaceId = req.nextUrl.searchParams.get("spaceId");
  if (!spaceId) return NextResponse.json({ error: "spaceId obrigatório" }, { status: 400 });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit não configurado. Defina LIVEKIT_API_KEY e LIVEKIT_API_SECRET no .env" },
      { status: 500 },
    );
  }

  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) return NextResponse.json({ error: "Space não encontrado" }, { status: 404 });
  if (space.status !== "LIVE")
    return NextResponse.json({ error: "Este Space já foi encerrado" }, { status: 410 });

  const isHost = space.hostId === user.id;

  const participant = await prisma.spaceParticipant.upsert({
    where: { spaceId_userId: { spaceId, userId: user.id } },
    create: { spaceId, userId: user.id, role: isHost ? "HOST" : "LISTENER" },
    update: {},
  });

  const canPublish = participant.role === "HOST" || participant.role === "SPEAKER";

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: user.name,
    metadata: JSON.stringify({
      username: user.username,
      avatarUrl: user.avatarUrl ?? null,
      role: participant.role,
    }),
  });
  at.addGrant({
    roomJoin: true,
    room: spaceId,
    canPublish,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({
    token,
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "",
    canPublish,
    isHost,
  });
}
