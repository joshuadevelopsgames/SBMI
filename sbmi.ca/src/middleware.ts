import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const publicPaths = ["/", "/login"];
const memberPaths = ["/dashboard", "/profile", "/payments", "/claims"];
const adminPaths = ["/admin"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const path = req.nextUrl.pathname;

  const isLoginArea = path === "/login" || path.startsWith("/login/");
  if (isLoginArea) {
    if (path === "/login" && token) return NextResponse.redirect(new URL("/dashboard", req.url));
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
