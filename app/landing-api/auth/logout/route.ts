import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/landing-admin/login", request.url), 303);
  response.cookies.set("landpages_admin", "", { path: "/", maxAge: 0 });
  return response;
}
