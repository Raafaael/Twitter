import { NextResponse, type NextRequest } from "next/server";

function isAuthPage(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/register/")
  );
}

function isAuthApi(pathname: string) {
  return pathname.startsWith("/api/auth/");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.get("session")?.value;

  // OAuth callbacks e redirects: sempre passa direto
  if (isAuthApi(pathname)) return NextResponse.next();

  if (!hasSession && !isAuthPage(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthPage(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/health).*)"],
};
