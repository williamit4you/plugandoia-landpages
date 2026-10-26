import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { db } from "@/lib/db";
import { getMetaReport } from "@/lib/metaReport";
import { text, number } from "@/lib/requestAnalytics";
import { ensureAnalyticsSchema } from "@/lib/schemaGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resources: Record<string, { table: string; order: string; hasAccount?: boolean }> = {
  accounts: { table: "meta_ad_accounts", order: "updated_at", hasAccount: false },
  campaigns: { table: "meta_campaigns", order: "synced_at", hasAccount: true },
  adsets: { table: "meta_adsets", order: "synced_at", hasAccount: true },
  ads: { table: "meta_ads", order: "synced_at", hasAccount: true },
  insights: { table: "meta_insights_daily", order: "insight_date", hasAccount: true },
  "sync-status": { table: "meta_sync_executions", order: "started_at", hasAccount: true },
  annotations: { table: "analytics_annotations", order: "occurred_on", hasAccount: false },
  "financial-plans": { table: "analytics_financial_plans", order: "month_start", hasAccount: false },
  experiments: { table: "analytics_experiments", order: "created_at", hasAccount: false },
};

function csvEscape(val: unknown) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

export async function GET(request: NextRequest, context: { params: { resource: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  await ensureAnalyticsSchema();

  const resKey = context.params.resource;
  const search = request.nextUrl.searchParams;

  if (resKey === "export-csv") {
    const days = Math.min(Math.max(Number(search.get("days") || 30), 1), 365);
    const report = await getMetaReport(days, search.get("account") || undefined, {
      since: search.get("since"),
      until: search.get("until"),
    });
    const header = [
      "campaign_id",
      "campaign_name",
      "status",
      "spend",
      "impressions",
      "link_clicks",
      "outbound_clicks",
      "link_ctr_pct",
      "link_cpc",
      "cpm",
      "attributed_sessions",
      "attributed_checkouts",
      "attributed_sales",
      "attributed_revenue",
      "attributed_commission",
      "roas_gross",
      "roas_commission",
      "net_result_after_ads",
      "attribution_rule",
    ];
    const lines = [
      header.join(","),
      ...report.campaigns.map((c: any) =>
        [
          c.id,
          c.name,
          c.effective_status || c.status,
          c.spend ?? "",
          c.impressions ?? "",
          c.link_clicks ?? "",
          c.outbound_clicks ?? "",
          c.linkCtr != null ? (c.linkCtr * 100).toFixed(2) : "",
          c.linkCpc != null ? c.linkCpc.toFixed(2) : "",
          c.cpm != null ? c.cpm.toFixed(2) : "",
          c.site?.sessions ?? 0,
          c.site?.checkouts ?? 0,
          c.sales?.sales ?? 0,
          c.sales?.revenue ?? "",
          c.sales?.commission ?? "",
          c.roasGross != null ? c.roasGross.toFixed(2) : "",
          c.roasCommission != null ? c.roasCommission.toFixed(2) : "",
          c.result != null ? c.result.toFixed(2) : "",
          c.attribution,
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="plugandoia-meta-analytics-${report.period.since}-a-${report.period.until}.csv"`,
      },
    });
  }

  const resource = resources[resKey];
  if (!resource) return NextResponse.json({ error: "Recurso não encontrado" }, { status: 404 });

  try {
    const limit = Math.min(Math.max(Number(search.get("limit") || 50), 1), 200);
    const offset = Math.min(Math.max(Number(search.get("offset") || 0), 0), 100_000);
    if (!Number.isFinite(limit) || !Number.isFinite(offset)) {
      return NextResponse.json({ error: "Paginação inválida" }, { status: 400 });
    }
    const filters: string[] = [];
    const values: unknown[] = [];
    const add = (column: string, value: string | null) => {
      if (!value) return;
      if (value.length > 160) throw new Error("Filtro inválido");
      values.push(value);
      filters.push(`${column} = $${values.length}`);
    };
    if (resource.hasAccount) add("account_id", search.get("account"));
    if (["adsets", "ads"].includes(resKey)) add("campaign_id", search.get("campaign"));
    if (resKey === "ads") add("adset_id", search.get("adset"));
    if (resKey === "insights") {
      add("level", search.get("level"));
      add("object_id", search.get("object"));
      add("breakdown_key", search.get("breakdown"));
      if (search.get("since")) {
        values.push(search.get("since"));
        filters.push(`insight_date >= $${values.length}::date`);
      }
      if (search.get("until")) {
        values.push(search.get("until"));
        filters.push(`insight_date <= $${values.length}::date`);
      }
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const count = await db.query(`SELECT COUNT(*)::int AS total FROM ${resource.table} ${where}`, values);
    const result = await db.query(
      `SELECT * FROM ${resource.table} ${where} ORDER BY ${resource.order} DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset],
    );
    return NextResponse.json({ data: result.rows, total: count.rows[0]?.total || 0, limit, offset });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar os dados." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: { resource: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  await ensureAnalyticsSchema();

  const resKey = context.params.resource;
  // Segurança absoluta: jamais permitir escrita em recursos da Meta Ads
  if (["accounts", "campaigns", "adsets", "ads", "insights"].includes(resKey)) {
    return NextResponse.json(
      { error: "Operação bloqueada: a integração Meta Ads opera exclusivamente em modo somente leitura." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));

  if (resKey === "annotations") {
    const title = text(body.title, 200);
    const category = text(body.category, 80) || "GERAL";
    const occurredOn = text(body.occurredOn, 20) || new Date().toISOString().slice(0, 10);
    const details = text(body.details, 1000);
    const campaignId = text(body.campaignId, 120);
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
      return NextResponse.json({ error: "Informe data e título válidos para a anotação." }, { status: 400 });
    }
    const id = randomUUID();
    await db.query(
      `INSERT INTO analytics_annotations (id, occurred_on, category, title, details, campaign_id)
       VALUES ($1, $2::date, $3, $4, $5, $6)`,
      [id, occurredOn, category, title, details, campaignId],
    );
    return NextResponse.json({ ok: true, id });
  }

  if (resKey === "financial-plans") {
    const name = text(body.name, 160) || "Plano Mensal";
    const monthStart = text(body.monthStart, 20) || `${new Date().toISOString().slice(0, 7)}-01`;
    const monthlyBudget = number(body.monthlyBudget);
    const targetRevenue = number(body.targetRevenue);
    const maxCpa = number(body.maxCpa);
    const targetConversion = number(body.targetConversion);
    const desiredMargin = number(body.desiredMargin);
    const minCtr = number(body.minCtr);
    const maxCpc = number(body.maxCpc);
    const campaignId = text(body.campaignId, 120);
    const productSlug = text(body.productSlug, 120);
    const id = randomUUID();
    await db.query(
      `INSERT INTO analytics_financial_plans (
        id, name, month_start, monthly_budget, target_revenue, max_cpa,
        target_conversion, desired_margin, min_ctr, max_cpc, campaign_id, product_slug, active
      ) VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE)`,
      [
        id,
        name,
        monthStart,
        monthlyBudget,
        targetRevenue,
        maxCpa,
        targetConversion,
        desiredMargin,
        minCtr,
        maxCpc,
        campaignId,
        productSlug,
      ],
    );
    return NextResponse.json({ ok: true, id });
  }

  if (resKey === "experiments") {
    const name = text(body.name, 200);
    const hypothesis = text(body.hypothesis, 1000);
    if (!name || !hypothesis) {
      return NextResponse.json({ error: "Informe nome e hipótese do experimento." }, { status: 400 });
    }
    const id = randomUUID();
    await db.query(
      `INSERT INTO analytics_experiments (
        id, name, hypothesis, campaign_id, audience_description, delivery_configuration,
        starts_on, ends_on, limitations, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, $10)`,
      [
        id,
        name,
        hypothesis,
        text(body.campaignId, 120),
        text(body.audienceDescription, 500),
        text(body.deliveryConfiguration, 500),
        text(body.startsOn, 20),
        text(body.endsOn, 20),
        text(body.limitations, 500),
        text(body.status, 40) || "RUNNING",
      ],
    );
    const creatives = Array.isArray(body.creatives) ? body.creatives : [];
    for (const cr of creatives.slice(0, 10)) {
      const label = text(cr?.label, 160);
      const adId = text(cr?.adId, 120);
      if (label) {
        await db.query(
          `INSERT INTO analytics_experiment_creatives (id, experiment_id, ad_id, label) VALUES ($1, $2, $3, $4)`,
          [randomUUID(), id, adId, label],
        );
      }
    }
    return NextResponse.json({ ok: true, id });
  }

  return NextResponse.json({ error: "Recurso não encontrado" }, { status: 404 });
}
