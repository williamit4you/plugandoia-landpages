import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/session";
export async function requireAdmin(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const valid = await verifyAdminSession(request.cookies.get("landpages_admin")?.value, secret);
  return valid ? null : NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
