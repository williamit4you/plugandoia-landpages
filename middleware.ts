import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/landing-admin/login") {
    return NextResponse.next();
  }

  const authenticated = await verifyAdminSession(
    request.cookies.get("landpages_admin")?.value,
    process.env.ADMIN_SESSION_SECRET,
  );

  if (authenticated) return NextResponse.next();

  const login = new URL("/landing-admin/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/landing-admin/:path*"],
};
