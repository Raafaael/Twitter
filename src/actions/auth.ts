"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(50),
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e _"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
});

const LoginSchema = z.object({
  identifier: z.string().trim().min(1, "Informe e-mail ou usuário"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type ActionState = { error?: string } | undefined;

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { name, username, email, password } = parsed.data;

  const dupe = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (dupe) {
    return {
      error: dupe.email === email ? "E-mail já cadastrado" : "Usuário já em uso",
    };
  }

  const user = await prisma.user.create({
    data: { name, username, email, passwordHash: await hashPassword(password) },
    select: { id: true },
  });
  await createSession(user.id);
  redirect("/");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { identifier, password } = parsed.data;
  const id = identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: id }, { username: id }] },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Credenciais inválidas" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
