import { prisma } from "./db";

export async function pickUsernameFromEmail(email: string): Promise<string> {
  const local = (email.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_]/g, "");
  const base =
    local.length >= 3
      ? local.slice(0, 18)
      : "user" + Math.random().toString(36).slice(2, 6);

  let candidate = base.slice(0, 20);
  let i = 1;
  while (
    await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })
  ) {
    i++;
    if (i > 100) {
      candidate = "user" + Math.random().toString(36).slice(2, 8);
      break;
    }
    const suffix = String(i);
    candidate = base.slice(0, 20 - suffix.length) + suffix;
  }
  return candidate;
}
