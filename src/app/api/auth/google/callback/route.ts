import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { pickUsernameFromEmail } from "@/lib/oauth";

const STATE_COOKIE = "oauth_state";

function back(req: NextRequest, code: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?oauth=${code}`;
  const res = NextResponse.redirect(url);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) return back(req, "denied");
  if (!code || !state) return back(req, "invalid");

  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  if (!cookieState || cookieState !== state) return back(req, "state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) return back(req, "config");

  // 1. Code -> token
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return back(req, "token");
    const data = (await tokenRes.json()) as { access_token?: string };
    if (!data.access_token) return back(req, "token");
    accessToken = data.access_token;
  } catch {
    return back(req, "token");
  }

  // 2. Token -> userinfo
  let info: { email?: string; verified_email?: boolean; name?: string; picture?: string };
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) return back(req, "userinfo");
    info = await userRes.json();
  } catch {
    return back(req, "userinfo");
  }

  if (!info.email || info.verified_email === false) return back(req, "noemail");
  const email = info.email.toLowerCase();

  // 3. Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.status === "BANNED") return back(req, "banned");
  } else {
    const username = await pickUsernameFromEmail(email);
    user = await prisma.user.create({
      data: {
        email,
        username,
        name: info.name?.trim() || username,
        avatarUrl: info.picture ?? null,
        passwordHash: null,
      },
    });
  }

  await createSession(user.id);

  const home = req.nextUrl.clone();
  home.pathname = "/";
  home.search = "";
  const res = NextResponse.redirect(home);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
