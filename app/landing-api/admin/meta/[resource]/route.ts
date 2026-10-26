import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const resources: Record<string, { table: string; order: string }> = {
  accounts: { table: "meta_ad_accounts", order: "updated_at" },
  campaigns: { table: "meta_campaigns", order: "synced_at" },
  adsets: { table: "meta_adsets", order: "synced_at" },
  ads: { table: "meta_ads", order: "synced_at" },
  insights: { table: "meta_insights_daily", order: "insight_date" },
  "sync-status": { table: "meta_sync_executions", order: "started_at" },
};
export async function GET(request: NextRequest, context: { params: { resource: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const resource = resources[context.params.resource];
  if (!resource) return NextResponse.json({ error: "Recurso não encontrado" }, { status: 404 });
  try {
    const search = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(Number(search.get("limit") || 50), 1), 200);
    const offset = Math.min(Math.max(Number(search.get("offset") || 0), 0), 100_000);
    if (!Number.isFinite(limit) || !Number.isFinite(offset)) return NextResponse.json({ error: "Paginação inválida" }, { status: 400 });
    const filters: string[] = []; const values: unknown[] = [];
    const add = (column: string, value: string | null) => {
      if (!value) return;
      if (value.length > 160) throw new Error("Filtro inválido");
      values.push(value); filters.push(`${column} = $${values.length}`);
    };
    if (context.params.resource !== "accounts") add("account_id", search.get("account"));
    if (["adsets","ads"].includes(context.params.resource)) add("campaign_id", search.get("campaign"));
    if (context.params.resource === "ads") add("adset_id", search.get("adset"));
    if (context.params.resource === "insights") {
      add("level", search.get("level")); add("object_id", search.get("object")); add("breakdown_key", search.get("breakdown"));
      if (search.get("since")) { values.push(search.get("since")); filters.push(`insight_date >= $${values.length}::date`); }
      if (search.get("until")) { values.push(search.get("until")); filters.push(`insight_date <= $${values.length}::date`); }
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const count = await db.query(`SELECT COUNT(*)::int AS total FROM ${resource.table} ${where}`, values);
    const result = await db.query(`SELECT * FROM ${resource.table} ${where} ORDER BY ${resource.order} DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,offset]);
    return NextResponse.json({ data: result.rows, total: count.rows[0]?.total || 0, limit, offset });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar os dados da Meta." }, { status: 500 });
  }
}
