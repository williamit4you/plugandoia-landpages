import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { meta, metaConfigured, MetaAdsError, type MetaBreakdown, type MetaLevel } from "@/lib/metaAds";

const levels: MetaLevel[] = ["account", "campaign", "adset", "ad"];
const breakdowns: MetaBreakdown[] = ["age,gender", "country", "region", "publisher_platform,platform_position", "device_platform"];
const field = (value: unknown) => value === null || value === undefined || value === "" ? null : String(value);
const numeric = (value: unknown) => {
  const result = Number(value);
  return value === null || value === undefined || value === "" || !Number.isFinite(result) ? null : result;
};
const asObject = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const actionValue = (value: unknown) => Array.isArray(value) ? value.reduce((sum, row) => sum + (numeric(asObject(row).value) || 0), 0) : null;
const day = (date: Date) => date.toISOString().slice(0, 10);
const dateValid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && day(new Date(value + "T00:00:00Z")) === value;
export function dateRange(since: string, until: string) {
  if (!dateValid(since) || !dateValid(until) || since > until) throw new Error("Período inválido.");
  const length = (Date.parse(until) - Date.parse(since)) / 86_400_000;
  if (length > 366) throw new Error("Importe no máximo 367 dias por solicitação.");
  const ranges: { since: string; until: string }[] = [];
  for (let start = Date.parse(since); start <= Date.parse(until); start += 14 * 86_400_000) {
    ranges.push({ since: day(new Date(start)), until: day(new Date(Math.min(start + 13 * 86_400_000, Date.parse(until)))) });
  }
  return ranges;
}
export function normalizedAccountId(value: string) {
  if (!/^(act_)?\d+$/.test(value)) throw new Error("ID da conta Meta inválido.");
  return value.startsWith("act_") ? value : `act_${value}`;
}
async function upsertAccount(account: Record<string, unknown>) {
  await db.query(`INSERT INTO meta_ad_accounts (id,name,currency,account_status,timezone_name)
    VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,currency=EXCLUDED.currency,
    account_status=EXCLUDED.account_status,timezone_name=EXCLUDED.timezone_name,updated_at=NOW()`,
    [field(account.id),field(account.name)||"Conta sem nome",field(account.currency),field(account.account_status),field(account.timezone_name)]);
}
async function syncStructure(accountId: string) {
  const campaigns = await meta.campaigns(accountId);
  for (const c of campaigns) await db.query(`INSERT INTO meta_campaigns (id,account_id,name,objective,status,effective_status,created_time,updated_time)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,objective=EXCLUDED.objective,
    status=EXCLUDED.status,effective_status=EXCLUDED.effective_status,updated_time=EXCLUDED.updated_time,synced_at=NOW()`,
    [c.id,accountId,c.name||"Campanha sem nome",c.objective,c.status,c.effective_status,c.created_time,c.updated_time]);
  const adsets = await meta.adsets(accountId);
  for (const a of adsets) await db.query(`INSERT INTO meta_adsets
    (id,account_id,campaign_id,name,status,effective_status,optimization_goal,daily_budget,lifetime_budget,budget_currency,start_time,end_time)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO UPDATE SET
    campaign_id=EXCLUDED.campaign_id,name=EXCLUDED.name,status=EXCLUDED.status,effective_status=EXCLUDED.effective_status,
    optimization_goal=EXCLUDED.optimization_goal,daily_budget=EXCLUDED.daily_budget,lifetime_budget=EXCLUDED.lifetime_budget,
    budget_currency=EXCLUDED.budget_currency,start_time=EXCLUDED.start_time,end_time=EXCLUDED.end_time,synced_at=NOW()`,
    [a.id,accountId,a.campaign_id,a.name||"Conjunto sem nome",a.status,a.effective_status,a.optimization_goal,
      numeric(a.daily_budget),numeric(a.lifetime_budget),null,a.start_time,a.end_time]);
  const ads = await meta.ads(accountId);
  for (const a of ads) {
    const creative = asObject(a.creative);
    await db.query(`INSERT INTO meta_ads
      (id,account_id,campaign_id,adset_id,name,status,effective_status,creative_id,creative,thumbnail_url,created_time,updated_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO UPDATE SET
      campaign_id=EXCLUDED.campaign_id,adset_id=EXCLUDED.adset_id,name=EXCLUDED.name,status=EXCLUDED.status,
      effective_status=EXCLUDED.effective_status,creative_id=EXCLUDED.creative_id,creative=EXCLUDED.creative,
      thumbnail_url=EXCLUDED.thumbnail_url,updated_time=EXCLUDED.updated_time,synced_at=NOW()`,
      [a.id,accountId,a.campaign_id,a.adset_id,a.name||"Anúncio sem nome",a.status,a.effective_status,
        creative.id||null,JSON.stringify(creative),creative.thumbnail_url||null,a.created_time,a.updated_time]);
  }
  return campaigns.length + adsets.length + ads.length;
}
async function upsertInsight(accountId: string, currency: string | null, level: MetaLevel, row: Record<string, unknown>, breakdown?: MetaBreakdown) {
  const objectId = level === "account" ? accountId : field(row[`${level}_id`]);
  if (!objectId || !dateValid(String(row.date_start))) return false;
  const breakdownData: Record<string, unknown> = {};
  if (breakdown) for (const key of breakdown.split(",")) breakdownData[key] = row[key] ?? null;
  const values = [
    accountId,objectId,level,row.date_start,breakdown||"none",JSON.stringify(breakdownData),"account_default",currency,
    numeric(row.spend),numeric(row.impressions),numeric(row.reach),numeric(row.frequency),numeric(row.clicks),
    numeric(row.inline_link_clicks),numeric(row.cpc),numeric(row.cpm),numeric(row.ctr),actionValue(row.outbound_clicks),
    numeric(row.inline_link_click_ctr),actionValue(row.cost_per_inline_link_click),
    actionValue(row.outbound_clicks_ctr),actionValue(row.cost_per_outbound_click),
    JSON.stringify(row.actions||[]),JSON.stringify(row.action_values||[]),JSON.stringify(row),
  ];
  await db.query(`INSERT INTO meta_insights_daily
    (account_id,object_id,level,insight_date,breakdown_key,breakdown,attribution_key,currency,spend,impressions,reach,
    frequency,clicks,inline_link_clicks,cpc,cpm,ctr,outbound_clicks,link_ctr,link_cpc,outbound_ctr,outbound_cpc,actions,action_values,raw_payload)
    VALUES (${values.map((_,i)=>`$${i+1}`).join(",")})
    ON CONFLICT (account_id,object_id,level,insight_date,breakdown_key,attribution_key) DO UPDATE SET
    currency=EXCLUDED.currency,spend=EXCLUDED.spend,impressions=EXCLUDED.impressions,reach=EXCLUDED.reach,
    frequency=EXCLUDED.frequency,clicks=EXCLUDED.clicks,inline_link_clicks=EXCLUDED.inline_link_clicks,cpc=EXCLUDED.cpc,
    cpm=EXCLUDED.cpm,ctr=EXCLUDED.ctr,outbound_clicks=EXCLUDED.outbound_clicks,link_ctr=EXCLUDED.link_ctr,
    link_cpc=EXCLUDED.link_cpc,outbound_ctr=EXCLUDED.outbound_ctr,outbound_cpc=EXCLUDED.outbound_cpc,
    actions=EXCLUDED.actions,action_values=EXCLUDED.action_values,raw_payload=EXCLUDED.raw_payload,updated_at=NOW()`, values);
  return true;
}
export async function syncMetaAds({ since, until, accountId: accountInput }: { since: string; until: string; accountId?: string }) {
  if (!metaConfigured()) throw new MetaAdsError("CONFIG", "Integração Meta não configurada.");
  const accountId = normalizedAccountId(accountInput || process.env.META_AD_ACCOUNT_ID!);
  const ranges = dateRange(since, until);
  const lock = await db.connect();
  const acquired = await lock.query("SELECT pg_try_advisory_lock(hashtext($1)) AS acquired",[`meta-sync:${accountId}`]);
  if (!acquired.rows[0]?.acquired) { lock.release(); throw new MetaAdsError("BUSY", "Já existe uma sincronização desta conta em andamento."); }
  const executionId = randomUUID();
  try {
    await db.query(`INSERT INTO meta_sync_executions (id,account_id,date_start,date_end,status) VALUES ($1,$2,$3,$4,'RUNNING')`,
      [executionId,accountId,since,until]);
  let imported = 0;
  try {
    const accounts = await meta.accounts();
    const account = accounts.find((item) => item.id === accountId);
    if (!account) throw new MetaAdsError("ACCOUNT", "A conta selecionada não está acessível com este token.");
    await upsertAccount(account);
    imported += await syncStructure(accountId);
    for (const range of ranges) {
      for (const level of levels) {
        const rows = await meta.insights(accountId,level,range.since,range.until);
        for (const row of rows) if (await upsertInsight(accountId,field(account.currency),level,row)) imported++;
      }
      for (const breakdown of breakdowns) {
        try {
          const rows = await meta.insights(accountId,"campaign",range.since,range.until,breakdown);
          for (const row of rows) if (await upsertInsight(accountId,field(account.currency),"campaign",row,breakdown)) imported++;
        } catch (error) {
          if (error instanceof MetaAdsError && !error.retryable && error.code !== "190") continue;
          throw error;
        }
      }
      await db.query("UPDATE meta_sync_executions SET imported_count=$2 WHERE id=$1",[executionId,imported]);
    }
    await db.query("UPDATE meta_sync_executions SET status='SUCCEEDED',finished_at=NOW(),imported_count=$2 WHERE id=$1",[executionId,imported]);
    return { executionId, accountId, imported };
  } catch (error) {
    const code = error instanceof MetaAdsError ? error.code : "PERSISTENCE";
    const message = error instanceof MetaAdsError ? error.message : "Falha ao persistir a sincronização.";
    await db.query("UPDATE meta_sync_executions SET status='FAILED',finished_at=NOW(),imported_count=$2,error_code=$3,error_message=$4 WHERE id=$1",[executionId,imported,code,message]);
    throw error;
  }
  } finally {
    await lock.query("SELECT pg_advisory_unlock(hashtext($1))",[`meta-sync:${accountId}`]);
    lock.release();
  }
}
