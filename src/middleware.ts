import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const publicPaths = ["/", "/login", "/dashboard"];
const memberPaths = ["/dashboard", "/profile", "/payments", "/claims"];
const adminPaths = ["/admin"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const path = req.nextUrl.pathname;

  /* Public static assets (matcher does not exclude these paths) */
  if (path.startsWith("/images/") || path === "/bylaws.pdf") {
    return NextResponse.next();
  }

  const isLoginArea = path === "/login" || path.startsWith("/login/");
  if (isLoginArea) {
    // Don't auto-redirect to dashboard - let the login page handle valid sessions
    // This avoids redirect loops when session cookie exists but is invalid
    return NextResponse.next();
  }
  const isPublic = publicPaths.some((p) => p === path || path.startsWith(p + "/"));
  if (isPublic) return NextResponse.next();

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("from", path);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
