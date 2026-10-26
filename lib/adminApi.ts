import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/session";

export function adminSessionSecret() {
  const value = String(process.env.ADMIN_SESSION_SECRET || "").trim();
  const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  return quoted ? value.slice(1, -1) : value;
}

export async function requireAdmin(request: NextRequest) {
  const valid = await verifyAdminSession(request.cookies.get("landpages_admin")?.value, adminSessionSecret());
  return valid ? null : NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
