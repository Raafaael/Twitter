import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { newCredentials, sendCodeEmail, sha256 } from "@/lib/verification";

function go(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url));
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return go(req, "/register?confirm=invalid");

  const row = await prisma.emailVerification.findUnique({
    where: { linkTokenHash: sha256(token) },
  });
  if (!row) return go(req, "/register?confirm=invalid");

  const emailQ = encodeURIComponent(row.email);

  // Já confirmado antes: segue direto pra senha (idempotente).
  if (row.verifiedAt) return go(req, `/register/password?email=${emailQ}`);

  // Link expirou: gera novo código + link, reenvia e repete o ciclo.
  if (row.expiresAt < new Date()) {
    const c = await newCredentials();
    await prisma.emailVerification.update({
      where: { email: row.email },
      data: {
        codeHash: c.codeHash,
        linkTokenHash: c.linkTokenHash,
        attempts: 0,
        lastSentAt: c.now,
        expiresAt: c.expiresAt,
        verifiedAt: null,
      },
    });
    await sendCodeEmail(row.email, row.name, c.code, c.linkToken);
    return go(req, `/register/verify?email=${emailQ}&expired=1`);
  }

  // Link válido: confirma a conta.
  await prisma.emailVerification.update({
    where: { email: row.email },
    data: { verifiedAt: new Date() },
  });
  return go(req, `/register/password?email=${emailQ}`);
}
