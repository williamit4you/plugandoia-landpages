import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { syncMetaAds } from "@/lib/metaSync";
import { ensureAnalyticsSchema } from "@/lib/schemaGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanSecret(value: string | undefined) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function sameSecret(expected: string, supplied: string) {
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function authorized(request: NextRequest) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
  const candidates = [
    cleanSecret(process.env.META_SYNC_SECRET),
    cleanSecret(process.env.ADMIN_SESSION_SECRET),
    cleanSecret(process.env.META_APP_SECRET),
  ].filter(Boolean);

  if (supplied && candidates.some((expected) => sameSecret(expected, supplied))) {
    return true;
  }

  const adminDenied = await requireAdmin(request);
  return adminDenied === null;
}

export async function POST(request: NextRequest) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await ensureAnalyticsSchema();
  const body = await request.json().catch(() => ({}));
  const now = new Date();
  const days = Math.min(Math.max(Number(body.days || 7), 1), 365);
  const until = typeof body.until === "string" && body.until ? body.until : now.toISOString().slice(0, 10);
  const since =
    typeof body.since === "string" && body.since
      ? body.since
      : new Date(now.getTime() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  try {
    const result = await syncMetaAds({ since, until, accountId: body.accountId });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha de sincronização" },
      { status: 500 },
    );
  }
}
