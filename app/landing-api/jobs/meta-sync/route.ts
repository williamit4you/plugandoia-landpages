import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { syncMetaAds } from "@/lib/metaSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function authorized(request: NextRequest) {
  const expected = process.env.META_SYNC_SECRET || "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i,"") || "";
  const a = Buffer.from(expected), b = Buffer.from(supplied);
  return Boolean(expected) && a.length === b.length && timingSafeEqual(a,b);
}
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const now = new Date();
  const until = typeof body.until === "string" ? body.until : now.toISOString().slice(0,10);
  const since = typeof body.since === "string" ? body.since : new Date(now.getTime()-6*86_400_000).toISOString().slice(0,10);
  try { return NextResponse.json(await syncMetaAds({ since, until, accountId: body.accountId })); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha de sincronização" }, { status: 500 }); }
}
