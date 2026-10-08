import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/session";

function adminSessionSecret() {
  const value = String(process.env.ADMIN_SESSION_SECRET || "").trim();
  const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  return quoted ? value.slice(1, -1) : value;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/landing-admin/login") {
    return NextResponse.next();
  }

  const authenticated = await verifyAdminSession(
    request.cookies.get("landpages_admin")?.value,
    adminSessionSecret(),
  );

  if (authenticated) return NextResponse.next();

  const login = new URL("/landing-admin/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/landing-admin/:path*"],
};
