import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ count: 0 });

  const count = await prisma.notification.count({
    where: { userId, read: false },
  });
  return NextResponse.json({ count });
}
