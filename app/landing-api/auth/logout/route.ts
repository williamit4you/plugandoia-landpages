import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = new NextResponse(null, {
    status: 303,
    headers: { location: "/landing-admin/login" },
  });
  response.cookies.set("landpages_admin", "", { path: "/", maxAge: 0 });
  return response;
}
