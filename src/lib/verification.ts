import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "./email";

export const CODE_TTL_MS = 10 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_ATTEMPTS = 5;

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export type Credentials = {
  code: string;
  codeHash: string;
  linkToken: string;
  linkTokenHash: string;
  now: Date;
  expiresAt: Date;
};

/** Gera um código de 6 dígitos + um token de link de alta entropia, já com hashes prontos. */
export async function newCredentials(): Promise<Credentials> {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const linkToken = crypto.randomBytes(32).toString("hex");
  const linkTokenHash = sha256(linkToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS);
  return { code, codeHash, linkToken, linkTokenHash, now, expiresAt };
}

/** Monta o link de confirmação e envia o e-mail com código + link. */
export async function sendCodeEmail(
  email: string,
  name: string,
  code: string,
  linkToken: string,
): Promise<void> {
  const link = `${appUrl()}/api/auth/confirm?token=${linkToken}`;
  await sendVerificationEmail(email, code, name, link);
}
