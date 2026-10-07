import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

function sameValue(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";

  if (!expectedEmail || !expectedPassword || !secret || !sameValue(email, expectedEmail) || !sameValue(password, expectedPassword)) {
    const failed = new URL("/landing-admin/login", request.url);
    failed.searchParams.set("error", "1");
    return NextResponse.redirect(failed, 303);
  }

  const destination = String(form.get("next") || "/landing-admin");
  const response = NextResponse.redirect(new URL(destination.startsWith("/") ? destination : "/landing-admin", request.url), 303);
  response.cookies.set("landpages_admin", await createAdminSession(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return response;
}
