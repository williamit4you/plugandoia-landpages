import { db } from "@/lib/db";
import { normalizedAccountId } from "@/lib/metaSync";

export const ratio = (numerator: number | null, denominator: number | null) =>
  numerator === null || denominator === null || denominator <= 0 ? null : numerator / denominator;
const amount = (value: unknown) => value === null || value === undefined ? null : Number(value);
export function reportPeriod(days: number) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const pick = (key: string) => parts.find((part) => part.type === key)?.value || "";
  const today = `${pick("year")}-${pick("month")}-${pick("day")}`;
  const end = Date.parse(today + "T00:00:00Z");
  return { since: new Date(end - (days-1)*86_400_000).toISOString().slice(0,10), until: today };
}
export async function getMetaReport(days: number, accountInput?: string) {
  const accountId = normalizedAccountId(accountInput || process.env.META_AD_ACCOUNT_ID || "");
  const { since, until } = reportPeriod(days);
  const [account, sync, totals, campaigns, adsets, ads, daily, site, purchases, siteTotal, hotmartTotal, breakdowns] = await Promise.all([
    db.query("SELECT id,name,currency,timezone_name,account_status FROM meta_ad_accounts WHERE id=$1",[accountId]),
    db.query("SELECT id,status,started_at,finished_at,date_start,date_end,imported_count,error_code,error_message FROM meta_sync_executions WHERE account_id=$1 ORDER BY started_at DESC LIMIT 1",[accountId]),
    db.query(`SELECT COUNT(*)::int AS days, SUM(spend)::float AS spend, SUM(impressions)::float AS impressions,
      SUM(clicks)::float AS clicks, SUM(inline_link_clicks)::float AS link_clicks,
      SUM(outbound_clicks)::float AS outbound_clicks, SUM(reach)::float AS daily_reach_sum
      FROM meta_insights_daily WHERE account_id=$1 AND level='account' AND breakdown_key='none'
      AND insight_date BETWEEN $2 AND $3`,[accountId,since,until]),
    db.query(`SELECT c.id,c.name,c.objective,c.status,c.effective_status,c.created_time,
      COUNT(i.insight_date)::int AS days,SUM(i.spend)::float AS spend,SUM(i.impressions)::float AS impressions,
      SUM(i.clicks)::float AS clicks,SUM(i.inline_link_clicks)::float AS link_clicks,
      SUM(i.outbound_clicks)::float AS outbound_clicks,SUM(i.reach)::float AS daily_reach_sum
      FROM meta_campaigns c LEFT JOIN meta_insights_daily i ON i.account_id=c.account_id AND i.object_id=c.id
      AND i.level='campaign' AND i.breakdown_key='none' AND i.insight_date BETWEEN $2 AND $3
      WHERE c.account_id=$1 GROUP BY c.id ORDER BY SUM(i.spend) DESC NULLS LAST,c.name`,[accountId,since,until]),
    db.query(`SELECT a.id,a.campaign_id,a.name,a.status,a.effective_status,a.optimization_goal,a.daily_budget,a.lifetime_budget,
      COUNT(i.insight_date)::int AS days,SUM(i.spend)::float AS spend,SUM(i.impressions)::float AS impressions,
      SUM(i.inline_link_clicks)::float AS link_clicks FROM meta_adsets a LEFT JOIN meta_insights_daily i ON
      i.account_id=a.account_id AND i.object_id=a.id AND i.level='adset' AND i.breakdown_key='none'
      AND i.insight_date BETWEEN $2 AND $3 WHERE a.account_id=$1 GROUP BY a.id ORDER BY SUM(i.spend) DESC NULLS LAST,a.name`,[accountId,since,until]),
    db.query(`SELECT a.id,a.campaign_id,a.adset_id,a.name,a.status,a.effective_status,a.creative_id,a.creative,a.thumbnail_url,
      COUNT(i.insight_date)::int AS days,SUM(i.spend)::float AS spend,SUM(i.impressions)::float AS impressions,
      SUM(i.inline_link_clicks)::float AS link_clicks,SUM(i.outbound_clicks)::float AS outbound_clicks
      FROM meta_ads a LEFT JOIN meta_insights_daily i ON i.account_id=a.account_id AND i.object_id=a.id
      AND i.level='ad' AND i.breakdown_key='none' AND i.insight_date BETWEEN $2 AND $3
      WHERE a.account_id=$1 GROUP BY a.id ORDER BY SUM(i.spend) DESC NULLS LAST,a.name`,[accountId,since,until]),
    db.query(`SELECT insight_date::text AS day,spend::float,impressions::float,inline_link_clicks::float AS link_clicks,
      outbound_clicks::float FROM meta_insights_daily WHERE account_id=$1 AND level='account'
      AND breakdown_key='none' AND insight_date BETWEEN $2 AND $3 ORDER BY insight_date`,[accountId,since,until]),
    db.query(`SELECT COALESCE(NULLIF(campaign_id,''),utm_campaign) AS campaign_id,COUNT(DISTINCT session_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS sessions,
      COUNT(*) FILTER (WHERE event_type='PAGE_VIEW')::int AS views,
      COUNT(*) FILTER (WHERE event_type='INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')
      AND COALESCE(NULLIF(campaign_id,''),utm_campaign) ~ '^[0-9]+$' GROUP BY COALESCE(NULLIF(campaign_id,''),utm_campaign)`,[since,until]),
    db.query(`WITH latest AS (
      SELECT DISTINCT ON (COALESCE(transaction_id,provider_event_id)) transaction_id,provider_event_id,status,amount,producer_commission,currency,session_id,received_at
      FROM hotmart_sales WHERE session_id IS NOT NULL
      ORDER BY COALESCE(transaction_id,provider_event_id),updated_at DESC,received_at DESC
    ), attributed AS (
      SELECT l.*,e.utm_campaign AS campaign_id FROM latest l JOIN LATERAL (
        SELECT COALESCE(NULLIF(campaign_id,''),utm_campaign) AS utm_campaign FROM landing_events WHERE session_id=l.session_id
        AND event_type='PAGE_VIEW' AND COALESCE(NULLIF(campaign_id,''),utm_campaign) ~ '^[0-9]+$'
        ORDER BY occurred_at ASC LIMIT 1
      ) e ON TRUE
      WHERE l.received_at >= $1::date AND l.received_at < ($2::date + INTERVAL '1 day')
    ) SELECT campaign_id,currency,
      COUNT(*) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::int AS sales,
      SUM(amount) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::float AS revenue,
      SUM(producer_commission) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::float AS commission,
      COUNT(*) FILTER (WHERE UPPER(status) LIKE '%REFUND%' OR UPPER(status) LIKE '%CHARGEBACK%')::int AS refunds
      FROM attributed GROUP BY campaign_id,currency`,[since,until]),
    db.query(`SELECT COUNT(DISTINCT session_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS sessions,
      COUNT(*) FILTER (WHERE event_type='PAGE_VIEW')::int AS views,
      COUNT(*) FILTER (WHERE event_type='INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')`,[since,until]),
    db.query(`WITH latest AS (
      SELECT DISTINCT ON (COALESCE(transaction_id,provider_event_id)) status,amount,producer_commission
      FROM hotmart_sales WHERE received_at >= $1::date AND received_at < ($2::date + INTERVAL '1 day')
      ORDER BY COALESCE(transaction_id,provider_event_id),updated_at DESC,received_at DESC
    ) SELECT COUNT(*) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::int AS sales,
      SUM(amount) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::float AS revenue,
      SUM(producer_commission) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::float AS commission
      FROM latest`,[since,until]),
    db.query(`SELECT breakdown_key,breakdown,SUM(spend)::float AS spend,SUM(impressions)::float AS impressions,
      SUM(inline_link_clicks)::float AS link_clicks FROM meta_insights_daily
      WHERE account_id=$1 AND level='campaign' AND breakdown_key<>'none'
      AND insight_date BETWEEN $2 AND $3 GROUP BY breakdown_key,breakdown ORDER BY spend DESC NULLS LAST LIMIT 100`,[accountId,since,until]),
  ]);
  const siteByCampaign = new Map(site.rows.map((row) => [row.campaign_id,row]));
  const salesByCampaign = new Map(purchases.rows.filter((row) => row.currency === account.rows[0]?.currency).map((row) => [row.campaign_id,row]));
  const campaignRows = campaigns.rows.map((row) => {
    const ownSite = siteByCampaign.get(row.id);
    const ownSales = salesByCampaign.get(row.id);
    const spend = amount(row.spend), linkClicks = amount(row.link_clicks), impressions = amount(row.impressions);
    const attributedSales = ownSales?.sales || 0;
    return { ...row, site: ownSite || null, sales: ownSales || null,
      linkCtr: ratio(linkClicks,impressions), linkCpc: ratio(spend,linkClicks),
      cpa: ratio(spend,attributedSales), roas: ratio(amount(ownSales?.revenue),spend),
      result: amount(ownSales?.commission) === null || spend === null ? null : Number(ownSales.commission) - spend,
      attribution: ownSales ? "session_id + campaign_id exato" : ownSite ? "campaign_id exato no UTM" : "Não atribuído" };
  });
  const total = totals.rows[0] || {};
  const totalSpend = amount(total.spend), totalImpressions = amount(total.impressions), totalLinkClicks = amount(total.link_clicks);
  return { account: account.rows[0] || null, sync: sync.rows[0] || null, period: { since,until,days },
    totals: { ...total, linkCtr: ratio(totalLinkClicks,totalImpressions), linkCpc: ratio(totalSpend,totalLinkClicks) },
    campaigns: campaignRows, adsets: adsets.rows, ads: ads.rows, daily: daily.rows,
    siteTotal: siteTotal.rows[0] || null, hotmartTotal: hotmartTotal.rows[0] || null,
    breakdowns: breakdowns.rows };
}
