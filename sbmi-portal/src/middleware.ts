import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login"];
const memberPaths = ["/dashboard", "/profile", "/payments", "/claims"];
const adminPaths = ["/admin"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sbmi_session")?.value;
  const path = req.nextUrl.pathname;

  const isPublic = publicPaths.some((p) => p === path || path.startsWith(p + "/"));
  if (isPublic && path !== "/login") return NextResponse.next();
  if (path === "/login") {
    if (token) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

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
