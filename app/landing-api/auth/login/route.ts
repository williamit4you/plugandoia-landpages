import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

function sameValue(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function redirect(location: string) {
  return new NextResponse(null, { status: 303, headers: { location } });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";

  if (!expectedEmail || !expectedPassword || !secret || !sameValue(email, expectedEmail) || !sameValue(password, expectedPassword)) {
    return redirect("/landing-admin/login?error=1");
  }

  const destination = String(form.get("next") || "/landing-admin");
  const response = redirect(destination.startsWith("/") ? destination : "/landing-admin");
  response.cookies.set("landpages_admin", await createAdminSession(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return response;
}
