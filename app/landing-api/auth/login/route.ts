import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

function sameValue(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function envValue(name: string) {
  const value = String(process.env[name] || "").trim();
  const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  return quoted ? value.slice(1, -1) : value;
}

function redirect(location: string) {
  return new NextResponse(null, { status: 303, headers: { location } });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const expectedEmail = envValue("ADMIN_EMAIL").toLowerCase();
  const expectedPassword = envValue("ADMIN_PASSWORD");
  const secret = envValue("ADMIN_SESSION_SECRET");

  if (!expectedEmail || !expectedPassword || !secret) {
    console.error("[admin auth] configuração incompleta", {
      adminEmailConfigured: Boolean(expectedEmail),
      adminPasswordConfigured: Boolean(expectedPassword),
      adminSessionSecretConfigured: Boolean(secret),
    });
    return redirect("/landing-admin/login?error=config");
  }

  if (!sameValue(email, expectedEmail) || !sameValue(password, expectedPassword)) {
    console.warn("[admin auth] credencial rejeitada", {
      emailMatches: sameValue(email, expectedEmail),
      passwordLengthMatches: password.length === expectedPassword.length,
    });
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
