"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { MAX_ATTEMPTS, RESEND_COOLDOWN_MS, newCredentials, sendCodeEmail } from "@/lib/verification";

export type ActionState = { error?: string; ok?: boolean } | undefined;

const Step1Schema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(50),
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e _"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
});

const CodeSchema = z.string().trim().regex(/^\d{6}$/, "Código de 6 dígitos");
const PasswordSchema = z.string().min(6, "Senha precisa ter ao menos 6 caracteres");

export async function startRegistrationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = Step1Schema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const { name, username, email } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existingUser) {
    return {
      error: existingUser.email === email ? "E-mail já cadastrado" : "Usuário já em uso",
    };
  }

  const conflictUsername = await prisma.emailVerification.findFirst({
    where: { username, email: { not: email } },
    select: { id: true },
  });
  if (conflictUsername) return { error: "Usuário já em uso" };

  const c = await newCredentials();

  await prisma.emailVerification.upsert({
    where: { email },
    create: {
      email,
      name,
      username,
      codeHash: c.codeHash,
      linkTokenHash: c.linkTokenHash,
      lastSentAt: c.now,
      expiresAt: c.expiresAt,
    },
    update: {
      name,
      username,
      codeHash: c.codeHash,
      linkTokenHash: c.linkTokenHash,
      attempts: 0,
      lastSentAt: c.now,
      expiresAt: c.expiresAt,
      verifiedAt: null,
    },
  });

  await sendCodeEmail(email, name, c.code, c.linkToken);

  redirect(`/register/verify?email=${encodeURIComponent(email)}`);
}

export async function resendCodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "E-mail ausente" };

  const row = await prisma.emailVerification.findUnique({ where: { email } });
  if (!row) return { error: "Comece o cadastro novamente" };

  const elapsed = Date.now() - row.lastSentAt.getTime();
  if (elapsed < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { error: `Aguarde ${remaining}s para reenviar` };
  }

  const c = await newCredentials();

  await prisma.emailVerification.update({
    where: { email },
    data: {
      codeHash: c.codeHash,
      linkTokenHash: c.linkTokenHash,
      attempts: 0,
      lastSentAt: c.now,
      expiresAt: c.expiresAt,
      verifiedAt: null,
    },
  });

  await sendCodeEmail(email, row.name, c.code, c.linkToken);

  return { ok: true };
}

export async function verifyCodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  if (!email) return { error: "E-mail ausente" };
  const codeParse = CodeSchema.safeParse(code);
  if (!codeParse.success) return { error: "Digite o código de 6 dígitos" };

  const row = await prisma.emailVerification.findUnique({ where: { email } });
  if (!row) return { error: "Cadastro não encontrado, comece de novo" };
  if (row.expiresAt < new Date()) return { error: "Código expirado, peça um novo" };
  if (row.attempts >= MAX_ATTEMPTS) {
    return { error: "Limite de tentativas excedido. Reenvie o código." };
  }

  const ok = await bcrypt.compare(code, row.codeHash);
  if (!ok) {
    const updated = await prisma.emailVerification.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    const left = MAX_ATTEMPTS - updated.attempts;
    return {
      error:
        left > 0
          ? `Código inválido. ${left} tentativa${left === 1 ? "" : "s"} restante${left === 1 ? "" : "s"}.`
          : "Limite excedido. Reenvie o código.",
    };
  }

  await prisma.emailVerification.update({
    where: { email },
    data: { verifiedAt: new Date() },
  });

  redirect(`/register/password?email=${encodeURIComponent(email)}`);
}

export async function completeRegistrationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "E-mail ausente" };
  const passwordParse = PasswordSchema.safeParse(formData.get("password"));
  if (!passwordParse.success) return { error: passwordParse.error.issues[0]?.message };

  const row = await prisma.emailVerification.findUnique({ where: { email } });
  if (!row) return { error: "Cadastro não encontrado, comece de novo" };
  if (!row.verifiedAt) return { error: "Verifique o e-mail primeiro" };

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        email: row.email,
        username: row.username,
        name: row.name,
        passwordHash: await hashPassword(passwordParse.data),
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return { error: "E-mail ou usuário já cadastrado" };
    }
    throw e;
  }

  await prisma.emailVerification.delete({ where: { email } });
  await createSession(userId);
  redirect("/");
}
