import { db } from "@/lib/db";
import { metaConfigState } from "@/lib/metaAds";
import {
  diagnoseCampaign,
  diagnoseFunnelStages,
  ratio,
  type DiagnosticTargets,
  type SmartAlert,
} from "@/lib/metaDiagnostics";
import { normalizedAccountId } from "@/lib/metaSync";
import { ensureAnalyticsSchema } from "@/lib/schemaGuard";

export { ratio };

const amount = (value: unknown) =>
  value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
    ? null
    : Number(value);

const asArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export function extractActionMetric(actions: unknown, types: string[]): number | null {
  const list = asArray(actions);
  if (!list.length) return null;
  for (const type of types) {
    const match = list.find((item) => String(item.action_type || "") === type);
    if (match && amount(match.value) !== null) return Number(match.value);
  }
  return null;
}

export function extractInsightExtras(rawPayload: unknown, actions: unknown, actionValues: unknown) {
  const raw = asObject(rawPayload);
  const act = actions ?? raw.actions;
  const val = actionValues ?? raw.action_values;

  const landingPageViews = extractActionMetric(act, ["landing_page_view", "omni_landing_page_view"]);
  const metaPurchases = extractActionMetric(act, [
    "purchase",
    "offsite_conversion.fb_pixel_purchase",
    "omni_purchase",
  ]);
  const metaPurchaseValue = extractActionMetric(val, [
    "purchase",
    "offsite_conversion.fb_pixel_purchase",
    "omni_purchase",
  ]);
  const metaCheckouts = extractActionMetric(act, [
    "initiate_checkout",
    "offsite_conversion.fb_pixel_initiate_checkout",
    "omni_initiated_checkout",
  ]);
  const reactions = extractActionMetric(act, ["post_reaction"]);
  const comments = extractActionMetric(act, ["comment"]);
  const shares = extractActionMetric(act, ["post"]);
  const postEngagement = extractActionMetric(act, ["post_engagement", "page_engagement"]);

  const videoPlays =
    extractActionMetric(raw.video_play_actions, ["video_view"]) ??
    extractActionMetric(act, ["video_view"]);
  const thruPlays = extractActionMetric(raw.video_thruplay_watched_actions, ["video_view"]);
  const videoP25 = extractActionMetric(raw.video_p25_watched_actions, ["video_view"]);
  const videoP50 = extractActionMetric(raw.video_p50_watched_actions, ["video_view"]);
  const videoP75 = extractActionMetric(raw.video_p75_watched_actions, ["video_view"]);
  const videoP95 = extractActionMetric(raw.video_p95_watched_actions, ["video_view"]);
  const videoP100 = extractActionMetric(raw.video_p100_watched_actions, ["video_view"]);
  const videoAvgTime = extractActionMetric(raw.video_avg_time_watched_actions, ["video_view"]);

  return {
    landingPageViews,
    metaPurchases,
    metaPurchaseValue,
    metaCheckouts,
    reactions,
    comments,
    shares,
    postEngagement,
    qualityRanking: typeof raw.quality_ranking === "string" ? raw.quality_ranking : null,
    engagementRanking: typeof raw.engagement_rate_ranking === "string" ? raw.engagement_rate_ranking : null,
    conversionRanking: typeof raw.conversion_rate_ranking === "string" ? raw.conversion_rate_ranking : null,
    videoPlays,
    thruPlays,
    videoP25,
    videoP50,
    videoP75,
    videoP95,
    videoP100,
    videoAvgTime,
  };
}

export function reportPeriod(
  daysOrPreset: number | string = 30,
  customSince?: string | null,
  customUntil?: string | null,
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (key: string) => parts.find((part) => part.type === key)?.value || "";
  const today = `${pick("year")}-${pick("month")}-${pick("day")}`;
  const todayMs = Date.parse(today + "T00:00:00Z");

  if (
    customSince &&
    customUntil &&
    /^\d{4}-\d{2}-\d{2}$/.test(customSince) &&
    /^\d{4}-\d{2}-\d{2}$/.test(customUntil) &&
    customSince <= customUntil
  ) {
    const days = Math.max(1, Math.round((Date.parse(customUntil) - Date.parse(customSince)) / 86_400_000) + 1);
    const prevEnd = Date.parse(customSince + "T00:00:00Z") - 86_400_000;
    const prevStart = prevEnd - (days - 1) * 86_400_000;
    return {
      since: customSince,
      until: customUntil,
      days,
      preset: "custom",
      prevSince: new Date(prevStart).toISOString().slice(0, 10),
      prevUntil: new Date(prevEnd).toISOString().slice(0, 10),
    };
  }

  const preset = String(daysOrPreset);
  if (preset === "yesterday") {
    const y = new Date(todayMs - 86_400_000).toISOString().slice(0, 10);
    const py = new Date(todayMs - 2 * 86_400_000).toISOString().slice(0, 10);
    return { since: y, until: y, days: 1, preset: "yesterday", prevSince: py, prevUntil: py };
  }
  if (preset === "this_month") {
    const since = `${pick("year")}-${pick("month")}-01`;
    const days = Math.max(1, Math.round((todayMs - Date.parse(since + "T00:00:00Z")) / 86_400_000) + 1);
    const prevEnd = Date.parse(since + "T00:00:00Z") - 86_400_000;
    const prevStart = prevEnd - (days - 1) * 86_400_000;
    return {
      since,
      until: today,
      days,
      preset: "this_month",
      prevSince: new Date(prevStart).toISOString().slice(0, 10),
      prevUntil: new Date(prevEnd).toISOString().slice(0, 10),
    };
  }
  if (preset === "last_month") {
    const firstThisMonth = new Date(`${pick("year")}-${pick("month")}-01T00:00:00Z`);
    const lastPrevMonth = new Date(firstThisMonth.getTime() - 86_400_000);
    const firstPrevMonth = new Date(
      Date.UTC(lastPrevMonth.getUTCFullYear(), lastPrevMonth.getUTCMonth(), 1),
    );
    const since = firstPrevMonth.toISOString().slice(0, 10);
    const until = lastPrevMonth.toISOString().slice(0, 10);
    const days = Math.max(1, Math.round((lastPrevMonth.getTime() - firstPrevMonth.getTime()) / 86_400_000) + 1);
    const prevEnd = firstPrevMonth.getTime() - 86_400_000;
    const prevStart = prevEnd - (days - 1) * 86_400_000;
    return {
      since,
      until,
      days,
      preset: "last_month",
      prevSince: new Date(prevStart).toISOString().slice(0, 10),
      prevUntil: new Date(prevEnd).toISOString().slice(0, 10),
    };
  }

  const days = Math.min(Math.max(Number(daysOrPreset) || 30, 1), 365);
  const sinceMs = todayMs - (days - 1) * 86_400_000;
  const prevEndMs = sinceMs - 86_400_000;
  const prevStartMs = prevEndMs - (days - 1) * 86_400_000;
  return {
    since: new Date(sinceMs).toISOString().slice(0, 10),
    until: today,
    days,
    preset: String(days),
    prevSince: new Date(prevStartMs).toISOString().slice(0, 10),
    prevUntil: new Date(prevEndMs).toISOString().slice(0, 10),
  };
}

export async function getMetaReport(
  daysOrPreset: number | string = 30,
  accountInput?: string,
  options?: { since?: string | null; until?: string | null },
) {
  await ensureAnalyticsSchema();
  const rawAccount = accountInput || process.env.META_AD_ACCOUNT_ID || "";
  let accountId = "act_0";
  try {
    if (rawAccount) accountId = normalizedAccountId(rawAccount);
  } catch {
    accountId = "act_0";
  }

  const period = reportPeriod(daysOrPreset, options?.since, options?.until);
  const { since, until, prevSince, prevUntil } = period;

  const [
    accountsList,
    account,
    sync,
    syncHistory,
    totals,
    prevTotals,
    campaigns,
    adsets,
    ads,
    daily,
    siteByCamp,
    siteByAdset,
    siteByAd,
    salesRows,
    siteTotal,
    hotmartTotal,
    breakdowns,
    annotations,
    plans,
    experiments,
  ] = await Promise.all([
    db.query("SELECT id,name,currency,timezone_name,account_status,updated_at FROM meta_ad_accounts ORDER BY updated_at DESC"),
    db.query("SELECT id,name,currency,timezone_name,account_status,updated_at FROM meta_ad_accounts WHERE id=$1", [
      accountId,
    ]),
    db.query(
      "SELECT id,status,started_at,finished_at,date_start,date_end,imported_count,error_code,error_message FROM meta_sync_executions WHERE account_id=$1 ORDER BY started_at DESC LIMIT 1",
      [accountId],
    ),
    db.query(
      "SELECT id,status,started_at,finished_at,date_start,date_end,imported_count,error_code,error_message FROM meta_sync_executions WHERE account_id=$1 ORDER BY started_at DESC LIMIT 15",
      [accountId],
    ),
    db.query(
      `SELECT COUNT(*)::int AS days, SUM(spend)::float AS spend, SUM(impressions)::float AS impressions,
        SUM(clicks)::float AS clicks, SUM(inline_link_clicks)::float AS link_clicks,
        SUM(outbound_clicks)::float AS outbound_clicks, MAX(reach)::float AS max_daily_reach,
        AVG(frequency)::float AS avg_frequency,
        jsonb_agg(actions) AS all_actions, jsonb_agg(action_values) AS all_action_values,
        jsonb_agg(raw_payload) AS all_raw
      FROM meta_insights_daily WHERE account_id=$1 AND level='account' AND breakdown_key='none'
      AND insight_date BETWEEN $2 AND $3`,
      [accountId, since, until],
    ),
    db.query(
      `SELECT SUM(spend)::float AS spend, SUM(impressions)::float AS impressions,
        SUM(clicks)::float AS clicks, SUM(inline_link_clicks)::float AS link_clicks,
        SUM(outbound_clicks)::float AS outbound_clicks
      FROM meta_insights_daily WHERE account_id=$1 AND level='account' AND breakdown_key='none'
      AND insight_date BETWEEN $2 AND $3`,
      [accountId, prevSince, prevUntil],
    ),
    db.query(
      `SELECT c.id,c.name,c.objective,c.status,c.effective_status,c.daily_budget::float,c.lifetime_budget::float,
        c.start_time,c.stop_time,c.created_time,c.updated_time,
        COUNT(i.insight_date)::int AS days,SUM(i.spend)::float AS spend,SUM(i.impressions)::float AS impressions,
        SUM(i.clicks)::float AS clicks,SUM(i.inline_link_clicks)::float AS link_clicks,
        SUM(i.outbound_clicks)::float AS outbound_clicks,MAX(i.reach)::float AS max_daily_reach,
        AVG(i.frequency)::float AS avg_frequency,
        jsonb_agg(i.raw_payload) FILTER (WHERE i.raw_payload IS NOT NULL) AS raw_list
      FROM meta_campaigns c LEFT JOIN meta_insights_daily i ON i.account_id=c.account_id AND i.object_id=c.id
      AND i.level='campaign' AND i.breakdown_key='none' AND i.insight_date BETWEEN $2 AND $3
      WHERE c.account_id=$1 GROUP BY c.id ORDER BY SUM(i.spend) DESC NULLS LAST,c.name`,
      [accountId, since, until],
    ),
    db.query(
      `SELECT a.id,a.campaign_id,a.name,a.status,a.effective_status,a.optimization_goal,
        a.daily_budget::float,a.lifetime_budget::float,a.targeting,a.start_time,a.end_time,
        COUNT(i.insight_date)::int AS days,SUM(i.spend)::float AS spend,SUM(i.impressions)::float AS impressions,
        SUM(i.clicks)::float AS clicks,SUM(i.inline_link_clicks)::float AS link_clicks,
        SUM(i.outbound_clicks)::float AS outbound_clicks,MAX(i.reach)::float AS max_daily_reach,
        AVG(i.frequency)::float AS avg_frequency
      FROM meta_adsets a LEFT JOIN meta_insights_daily i ON
      i.account_id=a.account_id AND i.object_id=a.id AND i.level='adset' AND i.breakdown_key='none'
      AND i.insight_date BETWEEN $2 AND $3 WHERE a.account_id=$1 GROUP BY a.id ORDER BY SUM(i.spend) DESC NULLS LAST,a.name`,
      [accountId, since, until],
    ),
    db.query(
      `SELECT a.id,a.campaign_id,a.adset_id,a.name,a.status,a.effective_status,a.creative_id,a.creative,
        a.thumbnail_url,a.destination_url,a.created_time,
        COUNT(i.insight_date)::int AS days,SUM(i.spend)::float AS spend,SUM(i.impressions)::float AS impressions,
        SUM(i.clicks)::float AS clicks,SUM(i.inline_link_clicks)::float AS link_clicks,
        SUM(i.outbound_clicks)::float AS outbound_clicks,MAX(i.reach)::float AS max_daily_reach,
        AVG(i.frequency)::float AS avg_frequency,
        jsonb_agg(i.raw_payload) FILTER (WHERE i.raw_payload IS NOT NULL) AS raw_list
      FROM meta_ads a LEFT JOIN meta_insights_daily i ON i.account_id=a.account_id AND i.object_id=a.id
      AND i.level='ad' AND i.breakdown_key='none' AND i.insight_date BETWEEN $2 AND $3
      WHERE a.account_id=$1 GROUP BY a.id ORDER BY SUM(i.spend) DESC NULLS LAST,a.name`,
      [accountId, since, until],
    ),
    db.query(
      `SELECT insight_date::text AS day,object_id,level,spend::float,impressions::float,reach::float,
        frequency::float,clicks::float,inline_link_clicks::float AS link_clicks,
        outbound_clicks::float FROM meta_insights_daily WHERE account_id=$1
      AND breakdown_key='none' AND insight_date BETWEEN $2 AND $3 ORDER BY insight_date`,
      [accountId, since, until],
    ),
    db.query(
      `SELECT COALESCE(NULLIF(campaign_id,''),utm_campaign) AS key,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS sessions,
        COUNT(*) FILTER (WHERE event_type='PAGE_VIEW')::int AS views,
        COUNT(*) FILTER (WHERE event_type IN ('VIEW_CONTENT','OUTBOUND_CLICK'))::int AS interactions,
        COUNT(*) FILTER (WHERE event_type='INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')
      AND COALESCE(NULLIF(campaign_id,''),utm_campaign) IS NOT NULL
      GROUP BY COALESCE(NULLIF(campaign_id,''),utm_campaign)`,
      [since, until],
    ),
    db.query(
      `SELECT COALESCE(NULLIF(adset_id,''),utm_term) AS key,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS sessions,
        COUNT(*) FILTER (WHERE event_type='PAGE_VIEW')::int AS views,
        COUNT(*) FILTER (WHERE event_type='INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')
      AND COALESCE(NULLIF(adset_id,''),utm_term) IS NOT NULL
      GROUP BY COALESCE(NULLIF(adset_id,''),utm_term)`,
      [since, until],
    ),
    db.query(
      `SELECT COALESCE(NULLIF(ad_id,''),utm_content) AS key,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS sessions,
        COUNT(*) FILTER (WHERE event_type='PAGE_VIEW')::int AS views,
        COUNT(*) FILTER (WHERE event_type='INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')
      AND COALESCE(NULLIF(ad_id,''),utm_content) IS NOT NULL
      GROUP BY COALESCE(NULLIF(ad_id,''),utm_content)`,
      [since, until],
    ),
    db.query(
      `WITH latest AS (
        SELECT DISTINCT ON (COALESCE(transaction_id,provider_event_id))
          id, transaction_id, provider_event_id, event_name, status, product_id, product_name,
          offer_code, buyer_name, buyer_email, amount::float, producer_commission::float, currency,
          page_key, session_id, visitor_id, journey_id, source_code,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          campaign_id, adset_id, ad_id, is_order_bump, parent_transaction_id,
          purchase_date, approved_date, received_at
        FROM hotmart_sales
        WHERE received_at >= $1::date AND received_at < ($2::date + INTERVAL '1 day')
        ORDER BY COALESCE(transaction_id,provider_event_id), updated_at DESC, received_at DESC
      )
      SELECT l.*,
        e.evt_campaign_id, e.evt_adset_id, e.evt_ad_id, e.evt_utm_campaign, e.evt_utm_source, e.evt_utm_content
      FROM latest l
      LEFT JOIN LATERAL (
        SELECT
          NULLIF(campaign_id,'') AS evt_campaign_id,
          NULLIF(adset_id,'') AS evt_adset_id,
          NULLIF(ad_id,'') AS evt_ad_id,
          NULLIF(utm_campaign,'') AS evt_utm_campaign,
          NULLIF(utm_source,'') AS evt_utm_source,
          NULLIF(utm_content,'') AS evt_utm_content
        FROM landing_events
        WHERE (l.session_id IS NOT NULL AND session_id = l.session_id)
           OR (l.journey_id IS NOT NULL AND journey_id = l.journey_id)
        ORDER BY (event_type = 'PAGE_VIEW') DESC, occurred_at ASC
        LIMIT 1
      ) e ON TRUE`,
      [since, until],
    ),
    db.query(
      `SELECT COUNT(DISTINCT session_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS sessions,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_type='PAGE_VIEW')::int AS visitors,
        COUNT(*) FILTER (WHERE event_type='PAGE_VIEW')::int AS views,
        COUNT(*) FILTER (WHERE event_type='VIEW_CONTENT')::int AS content_views,
        COUNT(*) FILTER (WHERE event_type='OUTBOUND_CLICK')::int AS interactions,
        COUNT(*) FILTER (WHERE event_type='INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')`,
      [since, until],
    ),
    db.query(
      `WITH latest AS (
        SELECT DISTINCT ON (COALESCE(transaction_id,provider_event_id))
          status, amount, producer_commission, is_order_bump
        FROM hotmart_sales WHERE received_at >= $1::date AND received_at < ($2::date + INTERVAL '1 day')
        ORDER BY COALESCE(transaction_id,provider_event_id), updated_at DESC, received_at DESC
      )
      SELECT
        COUNT(*) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::int AS sales,
        SUM(amount) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::float AS revenue,
        SUM(producer_commission) FILTER (WHERE UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%')::float AS commission,
        COUNT(*) FILTER (WHERE UPPER(status) LIKE '%REFUND%' OR UPPER(status) LIKE '%CHARGEBACK%')::int AS refunds,
        SUM(amount) FILTER (WHERE UPPER(status) LIKE '%REFUND%' OR UPPER(status) LIKE '%CHARGEBACK%')::float AS refunded_amount,
        COUNT(*) FILTER (WHERE is_order_bump AND (UPPER(status) LIKE '%APPROV%' OR UPPER(status) LIKE '%COMPLET%'))::int AS order_bumps
      FROM latest`,
      [since, until],
    ),
    db.query(
      `SELECT breakdown_key,breakdown,SUM(spend)::float AS spend,SUM(impressions)::float AS impressions,
        SUM(clicks)::float AS clicks,SUM(inline_link_clicks)::float AS link_clicks,
        SUM(outbound_clicks)::float AS outbound_clicks,MAX(reach)::float AS max_reach
      FROM meta_insights_daily
      WHERE account_id=$1 AND level='campaign' AND breakdown_key<>'none'
      AND insight_date BETWEEN $2 AND $3 GROUP BY breakdown_key,breakdown ORDER BY spend DESC NULLS LAST LIMIT 150`,
      [accountId, since, until],
    ),
    db.query(
      `SELECT id, occurred_on::text, category, title, details, campaign_id, created_at
       FROM analytics_annotations ORDER BY occurred_on DESC, created_at DESC LIMIT 50`,
    ),
    db.query(
      `SELECT id, name, month_start::text, monthly_budget::float, target_revenue::float,
              max_cpa::float, target_conversion::float, desired_margin::float,
              min_ctr::float, max_cpc::float, campaign_id, product_slug, active
       FROM analytics_financial_plans WHERE active = TRUE ORDER BY month_start DESC, created_at DESC LIMIT 20`,
    ),
    db.query(
      `SELECT e.id, e.name, e.hypothesis, e.campaign_id, e.audience_description, e.delivery_configuration,
              e.starts_on::text, e.ends_on::text, e.limitations, e.status, e.created_at,
              COALESCE(jsonb_agg(jsonb_build_object('id', c.id, 'ad_id', c.ad_id, 'label', c.label))
                FILTER (WHERE c.id IS NOT NULL), '[]'::jsonb) AS creatives
       FROM analytics_experiments e
       LEFT JOIN analytics_experiment_creatives c ON c.experiment_id = e.id
       GROUP BY e.id ORDER BY e.created_at DESC LIMIT 25`,
    ),
  ]);

  // Helper to aggregate array of daily raw_payloads for an object
  const sumRawInsights = (rawList: unknown) => {
    const items = asArray(rawList);
    let landingPageViews = 0,
      hasLpv = false,
      metaPurchases = 0,
      hasMp = false,
      metaPurchaseValue = 0,
      metaCheckouts = 0,
      reactions = 0,
      comments = 0,
      shares = 0,
      postEngagement = 0,
      videoPlays = 0,
      thruPlays = 0,
      videoP25 = 0,
      videoP50 = 0,
      videoP75 = 0,
      videoP95 = 0,
      videoP100 = 0,
      videoAvgSum = 0,
      videoAvgCount = 0;
    let qualityRanking: string | null = null;
    let engagementRanking: string | null = null;
    let conversionRanking: string | null = null;

    for (const raw of items) {
      const ext = extractInsightExtras(raw, raw.actions, raw.action_values);
      if (ext.landingPageViews !== null) {
        landingPageViews += ext.landingPageViews;
        hasLpv = true;
      }
      if (ext.metaPurchases !== null) {
        metaPurchases += ext.metaPurchases;
        hasMp = true;
      }
      if (ext.metaPurchaseValue !== null) metaPurchaseValue += ext.metaPurchaseValue;
      if (ext.metaCheckouts !== null) metaCheckouts += ext.metaCheckouts;
      if (ext.reactions !== null) reactions += ext.reactions;
      if (ext.comments !== null) comments += ext.comments;
      if (ext.shares !== null) shares += ext.shares;
      if (ext.postEngagement !== null) postEngagement += ext.postEngagement;
      if (ext.videoPlays !== null) videoPlays += ext.videoPlays;
      if (ext.thruPlays !== null) thruPlays += ext.thruPlays;
      if (ext.videoP25 !== null) videoP25 += ext.videoP25;
      if (ext.videoP50 !== null) videoP50 += ext.videoP50;
      if (ext.videoP75 !== null) videoP75 += ext.videoP75;
      if (ext.videoP95 !== null) videoP95 += ext.videoP95;
      if (ext.videoP100 !== null) videoP100 += ext.videoP100;
      if (ext.videoAvgTime !== null) {
        videoAvgSum += ext.videoAvgTime;
        videoAvgCount++;
      }
      if (ext.qualityRanking && ext.qualityRanking !== "UNKNOWN") qualityRanking = ext.qualityRanking;
      if (ext.engagementRanking && ext.engagementRanking !== "UNKNOWN") engagementRanking = ext.engagementRanking;
      if (ext.conversionRanking && ext.conversionRanking !== "UNKNOWN") conversionRanking = ext.conversionRanking;
    }

    return {
      landingPageViews: hasLpv ? landingPageViews : null,
      metaPurchases: hasMp ? metaPurchases : null,
      metaPurchaseValue: metaPurchaseValue > 0 ? metaPurchaseValue : null,
      metaCheckouts: metaCheckouts > 0 ? metaCheckouts : null,
      reactions: reactions > 0 ? reactions : null,
      comments: comments > 0 ? comments : null,
      shares: shares > 0 ? shares : null,
      postEngagement: postEngagement > 0 ? postEngagement : null,
      qualityRanking,
      engagementRanking,
      conversionRanking,
      videoPlays: videoPlays > 0 ? videoPlays : null,
      thruPlays: thruPlays > 0 ? thruPlays : null,
      videoP25: videoP25 > 0 ? videoP25 : null,
      videoP50: videoP50 > 0 ? videoP50 : null,
      videoP75: videoP75 > 0 ? videoP75 : null,
      videoP95: videoP95 > 0 ? videoP95 : null,
      videoP100: videoP100 > 0 ? videoP100 : null,
      videoAvgTime: videoAvgCount > 0 ? videoAvgSum / videoAvgCount : null,
    };
  };

  // Map campaigns by ID and exact normalized name
  const campaignById = new Map(campaigns.rows.map((c) => [String(c.id), c]));
  const campaignIdByName = new Map(
    campaigns.rows.map((c) => [String(c.name || "").trim().toLowerCase(), String(c.id)]),
  );
  const adById = new Map(ads.rows.map((a) => [String(a.id), a]));

  // Site attribution maps
  const siteCampMap = new Map<string, { sessions: number; views: number; interactions: number; checkouts: number }>();
  for (const row of siteByCamp.rows) {
    const rawKey = String(row.key || "").trim();
    const resolvedId = campaignById.has(rawKey)
      ? rawKey
      : campaignIdByName.get(rawKey.toLowerCase()) || rawKey;
    const prev = siteCampMap.get(resolvedId) || { sessions: 0, views: 0, interactions: 0, checkouts: 0 };
    siteCampMap.set(resolvedId, {
      sessions: prev.sessions + Number(row.sessions || 0),
      views: prev.views + Number(row.views || 0),
      interactions: prev.interactions + Number(row.interactions || 0),
      checkouts: prev.checkouts + Number(row.checkouts || 0),
    });
  }

  const siteAdsetMap = new Map(siteByAdset.rows.map((r) => [String(r.key), r]));
  const siteAdMap = new Map(siteByAd.rows.map((r) => [String(r.key), r]));

  // Sales attribution & audit
  type SalesAgg = {
    sales: number;
    revenue: number;
    commission: number;
    refunds: number;
    refundedAmount: number;
    confidence: "alta" | "média" | "baixa";
    ruleUsed: string;
  };
  const salesByCampaign = new Map<string, SalesAgg>();
  const salesByAdset = new Map<string, SalesAgg>();
  const salesByAd = new Map<string, SalesAgg>();

  const auditedSales = salesRows.rows.map((sale) => {
    const statusUpper = String(sale.status || sale.event_name || "").toUpperCase();
    const isApproved = statusUpper.includes("APPROV") || statusUpper.includes("COMPLET");
    const isRefund = statusUpper.includes("REFUND") || statusUpper.includes("CHARGEBACK");

    const directCampId = sale.campaign_id || sale.evt_campaign_id;
    const utmCamp = sale.utm_campaign || sale.evt_utm_campaign;
    const directAdsetId = sale.adset_id || sale.evt_adset_id;
    const directAdId = sale.ad_id || sale.evt_ad_id || sale.utm_content || sale.evt_utm_content;

    let resolvedCampaignId: string | null = null;
    let ruleUsed = "NAO_ATRIBUIDO";
    let confidence: "alta" | "média" | "baixa" | "nenhuma" = "nenhuma";
    let evidence = "Sem vínculo técnico de sessão, jornada ou ID da campanha";

    if (directCampId && campaignById.has(String(directCampId))) {
      resolvedCampaignId = String(directCampId);
      ruleUsed = sale.journey_id
        ? "ID_EXATO_JORNADA"
        : sale.session_id
          ? "ID_EXATO_SESSAO"
          : "ID_DIRETO_WEBHOOK";
      confidence = "alta";
      evidence = `${ruleUsed} (campaign_id=${resolvedCampaignId})`;
    } else if (utmCamp && campaignById.has(String(utmCamp))) {
      resolvedCampaignId = String(utmCamp);
      ruleUsed = sale.session_id || sale.journey_id ? "ID_EM_UTM_SESSAO" : "ID_EM_UTM_WEBHOOK";
      confidence = "alta";
      evidence = `utm_campaign contém ID exato (${resolvedCampaignId})`;
    } else if (directAdId && adById.has(String(directAdId))) {
      const matchedAd = adById.get(String(directAdId))!;
      resolvedCampaignId = String(matchedAd.campaign_id);
      ruleUsed = "ID_EXATO_ANUNCIO";
      confidence = "alta";
      evidence = `ad_id/utm_content contém ID exato do anúncio (${directAdId})`;
    } else if (utmCamp && campaignIdByName.has(String(utmCamp).trim().toLowerCase())) {
      resolvedCampaignId = campaignIdByName.get(String(utmCamp).trim().toLowerCase())!;
      ruleUsed = "NOME_EXATO_UTM";
      confidence = "média";
      evidence = `utm_campaign corresponde ao nome exato da campanha (${utmCamp})`;
    } else if (utmCamp) {
      resolvedCampaignId = String(utmCamp);
      ruleUsed = "UTM_EXTERNA_OU_MANUAL";
      confidence = "baixa";
      evidence = `utm_campaign="${utmCamp}" (sem campanha correspondente na conta Meta atual)`;
    }

    const resolvedAdId = directAdId && adById.has(String(directAdId)) ? String(directAdId) : null;
    const resolvedAdsetId =
      directAdsetId || (resolvedAdId ? String(adById.get(resolvedAdId)?.adset_id || "") : null) || null;

    const addAgg = (map: Map<string, SalesAgg>, key: string | null) => {
      if (!key) return;
      const cur = map.get(key) || {
        sales: 0,
        revenue: 0,
        commission: 0,
        refunds: 0,
        refundedAmount: 0,
        confidence: confidence === "nenhuma" ? "baixa" : confidence,
        ruleUsed,
      };
      if (isApproved) {
        cur.sales += 1;
        cur.revenue += Number(sale.amount || 0);
        cur.commission += Number(sale.producer_commission ?? sale.amount ?? 0);
      }
      if (isRefund) {
        cur.refunds += 1;
        cur.refundedAmount += Number(sale.amount || 0);
      }
      map.set(key, cur);
    };

    addAgg(salesByCampaign, resolvedCampaignId);
    addAgg(salesByAdset, resolvedAdsetId);
    addAgg(salesByAd, resolvedAdId);

    return {
      ...sale,
      isApproved,
      isRefund,
      resolvedCampaignId,
      resolvedCampaignName: resolvedCampaignId ? campaignById.get(resolvedCampaignId)?.name || resolvedCampaignId : null,
      resolvedAdsetId,
      resolvedAdId,
      resolvedAdName: resolvedAdId ? adById.get(resolvedAdId)?.name || resolvedAdId : null,
      ruleUsed,
      confidence,
      evidence,
    };
  });

  const activePlan = plans.rows[0] || null;
  const diagnosticTargets: DiagnosticTargets = {
    minCtr: activePlan?.min_ctr ? Number(activePlan.min_ctr) : undefined,
    maxCpc: activePlan?.max_cpc ? Number(activePlan.max_cpc) : undefined,
    maxCpa: activePlan?.max_cpa ? Number(activePlan.max_cpa) : undefined,
    minCheckoutRate: activePlan?.target_conversion ? Number(activePlan.target_conversion) : undefined,
  };

  const totalRow = totals.rows[0] || {};
  const totalSpend = amount(totalRow.spend);
  const totalImpressions = amount(totalRow.impressions);
  const totalClicks = amount(totalRow.clicks);
  const totalLinkClicks = amount(totalRow.link_clicks);
  const totalOutboundClicks = amount(totalRow.outbound_clicks);
  const totalExtras = sumRawInsights(totalRow.all_raw);
  const accountLinkCtr = ratio(totalLinkClicks, totalImpressions);
  const accountLinkCpc = ratio(totalSpend, totalLinkClicks);
  const accountCpm = totalSpend !== null && totalImpressions ? (totalSpend / totalImpressions) * 1000 : null;

  const prevRow = prevTotals.rows[0] || {};
  const prevSpend = amount(prevRow.spend);
  const prevImpressions = amount(prevRow.impressions);
  const prevLinkClicks = amount(prevRow.link_clicks);

  const campaignRows = campaigns.rows.map((row) => {
    const ownSite = siteCampMap.get(String(row.id)) || null;
    const ownSales = salesByCampaign.get(String(row.id)) || null;
    const spend = amount(row.spend);
    const linkClicks = amount(row.link_clicks);
    const outboundClicks = amount(row.outbound_clicks);
    const impressions = amount(row.impressions);
    const clicks = amount(row.clicks);
    const extras = sumRawInsights(row.raw_list);
    const attributedSales = ownSales?.sales || 0;
    const revenue = ownSales ? ownSales.revenue : null;
    const commission = ownSales ? ownSales.commission : null;
    const cpm = spend !== null && impressions ? (spend / impressions) * 1000 : null;
    const linkCtr = ratio(linkClicks, impressions);
    const linkCpc = ratio(spend, linkClicks);
    const outboundCtr = ratio(outboundClicks, impressions);
    const outboundCpc = ratio(spend, outboundClicks);
    const cpa = ratio(spend, attributedSales);
    const roasGross = ratio(revenue, spend);
    const roasCommission = ratio(commission, spend);
    const result = commission !== null && spend !== null ? commission - spend : null;
    const costPerSession = ratio(spend, ownSite?.sessions ?? null);
    const arrivalRate = ratio(ownSite?.sessions ?? null, outboundClicks || linkClicks);
    const checkoutRate = ratio(ownSite?.checkouts ?? null, ownSite?.sessions ?? null);
    const purchaseRate = ratio(attributedSales, ownSite?.checkouts ?? null);

    const diagnostics = diagnoseCampaign(
      {
        id: row.id,
        name: row.name,
        impressions,
        link_clicks: linkClicks,
        outbound_clicks: outboundClicks,
        spend,
        frequency: amount(row.avg_frequency),
        cpm,
        site: ownSite,
        sales: ownSales,
      },
      accountLinkCtr,
      diagnosticTargets,
    );

    const primaryTone = diagnostics.some((d) => d.tone === "red")
      ? "red"
      : diagnostics.some((d) => d.tone === "yellow")
        ? "yellow"
        : diagnostics.some((d) => d.tone === "green")
          ? "green"
          : "gray";

    return {
      ...row,
      spend,
      impressions,
      clicks,
      link_clicks: linkClicks,
      outbound_clicks: outboundClicks,
      cpm,
      ctr: ratio(clicks, impressions),
      cpc: ratio(spend, clicks),
      linkCtr,
      linkCpc,
      outboundCtr,
      outboundCpc,
      extras,
      site: ownSite,
      sales: ownSales,
      cpa,
      roas: roasGross,
      roasGross,
      roasCommission,
      result,
      costPerSession,
      arrivalRate,
      checkoutRate,
      purchaseRate,
      diagnostics,
      primaryTone,
      attribution: ownSales
        ? `${ownSales.ruleUsed} (${ownSales.confidence})`
        : ownSite
          ? "campaign_id / utm_campaign no site"
          : "Não atribuído",
    };
  });

  const adsetRows = adsets.rows.map((row) => {
    const spend = amount(row.spend);
    const impressions = amount(row.impressions);
    const linkClicks = amount(row.link_clicks);
    const outboundClicks = amount(row.outbound_clicks);
    const ownSite = siteAdsetMap.get(String(row.id)) || null;
    const ownSales = salesByAdset.get(String(row.id)) || null;
    const commission = ownSales ? ownSales.commission : null;
    return {
      ...row,
      spend,
      impressions,
      link_clicks: linkClicks,
      outbound_clicks: outboundClicks,
      cpm: spend !== null && impressions ? (spend / impressions) * 1000 : null,
      linkCtr: ratio(linkClicks, impressions),
      linkCpc: ratio(spend, linkClicks),
      site: ownSite,
      sales: ownSales,
      cpa: ratio(spend, ownSales?.sales || 0),
      roasCommission: ratio(commission, spend),
      result: commission !== null && spend !== null ? commission - spend : null,
    };
  });

  const adRows = ads.rows.map((row) => {
    const spend = amount(row.spend);
    const impressions = amount(row.impressions);
    const linkClicks = amount(row.link_clicks);
    const outboundClicks = amount(row.outbound_clicks);
    const extras = sumRawInsights(row.raw_list);
    const creativeObj = asObject(row.creative);
    const ownSite = siteAdMap.get(String(row.id)) || null;
    const ownSales = salesByAd.get(String(row.id)) || null;
    const commission = ownSales ? ownSales.commission : null;
    const mediaType =
      String(creativeObj.object_type || "").toUpperCase().includes("VIDEO") || extras.videoPlays
        ? "VIDEO"
        : "IMAGE";
    const hasTrackingParams = Boolean(
      row.destination_url &&
        (String(row.destination_url).includes("utm_") || String(row.destination_url).includes("campaign_id")),
    );
    return {
      ...row,
      spend,
      impressions,
      link_clicks: linkClicks,
      outbound_clicks: outboundClicks,
      cpm: spend !== null && impressions ? (spend / impressions) * 1000 : null,
      linkCtr: ratio(linkClicks, impressions),
      linkCpc: ratio(spend, linkClicks),
      creativeTitle: typeof creativeObj.title === "string" ? creativeObj.title : null,
      creativeBody: typeof creativeObj.body === "string" ? creativeObj.body : null,
      mediaType,
      hasTrackingParams,
      extras,
      site: ownSite,
      sales: ownSales,
      cpa: ratio(spend, ownSales?.sales || 0),
      roasGross: ratio(ownSales ? ownSales.revenue : null, spend),
      roasCommission: ratio(commission, spend),
      result: commission !== null && spend !== null ? commission - spend : null,
    };
  });

  // Aggregate attributed vs unattributed sales totals
  const approvedAudited = auditedSales.filter((s) => s.isApproved);
  const attributedApproved = approvedAudited.filter((s) => s.confidence !== "nenhuma");
  const unattributedApproved = approvedAudited.filter((s) => s.confidence === "nenhuma");

  const attributedSalesCount = attributedApproved.length;
  const attributedRevenue = attributedApproved.reduce((s, r) => s + Number(r.amount || 0), 0);
  const attributedCommission = attributedApproved.reduce(
    (s, r) => s + Number(r.producer_commission ?? r.amount ?? 0),
    0,
  );
  const attributedSessionsCount = Array.from(siteCampMap.values()).reduce((s, r) => s + r.sessions, 0);
  const attributedCheckoutsCount = Array.from(siteCampMap.values()).reduce((s, r) => s + r.checkouts, 0);

  const hotmartRow = hotmartTotal.rows[0] || {};
  const totalHotmartSales = Number(hotmartRow.sales || 0);
  const totalHotmartRevenue = Number(hotmartRow.revenue || 0);
  const totalHotmartCommission = Number(hotmartRow.commission || 0);
  const totalHotmartRefunds = Number(hotmartRow.refunds || 0);
  const totalHotmartRefundedAmount = Number(hotmartRow.refunded_amount || 0);

  const siteRow = siteTotal.rows[0] || {};
  const stageDiagnostics = diagnoseFunnelStages({
    impressions: totalImpressions,
    cpm: accountCpm,
    frequency: amount(totalRow.avg_frequency),
    linkClicks: totalLinkClicks,
    outboundClicks: totalOutboundClicks,
    linkCtr: accountLinkCtr,
    linkCpc: accountLinkCpc,
    sessions: Number(siteRow.sessions || 0),
    attributedSessions: attributedSessionsCount,
    contentViews: Number(siteRow.content_views || 0),
    interactions: Number(siteRow.interactions || 0),
    avgScrollDepth: null,
    avgLcpMs: null,
    jsErrors: null,
    checkouts: Number(siteRow.checkouts || 0),
    purchases: totalHotmartSales,
    spend: totalSpend,
    commission: totalHotmartCommission,
    attributedCommission,
    targets: diagnosticTargets,
  });

  // Generate Smart Alerts & Opportunities
  const alerts: SmartAlert[] = [];
  const periodLabel = `${since} a ${until}`;
  const syncRow = sync.rows[0] || null;
  const syncAgeHours = syncRow?.finished_at
    ? (Date.now() - new Date(syncRow.finished_at).getTime()) / 3_600_000
    : null;

  if (!syncRow || syncRow.status === "FAILED" || (syncAgeHours !== null && syncAgeHours > 12)) {
    alerts.push({
      id: "sync-stale",
      tone: syncRow?.status === "FAILED" ? "red" : "yellow",
      kind: "data_health",
      title: syncRow?.status === "FAILED" ? "Última sincronização da Meta Ads falhou" : "Dados da Meta Ads desatualizados ou pendentes",
      metricInvolved: "Sincronização Meta API",
      periodLabel,
      evidence: syncRow?.finished_at
        ? `Última execução concluída há ${syncAgeHours?.toFixed(1)}h (status: ${syncRow.status}).`
        : "Nenhuma sincronização concluída foi registrada ainda para esta conta.",
      confidence: "alta",
      simpleExplanation: "Os números de gasto e cliques podem não refletir as últimas horas até que uma nova sincronização seja executada.",
      investigationActions: [
        "Clique em 'Sincronizar Meta Ads agora' no topo do painel",
        "Confira o status das variáveis META_ACCESS_TOKEN e META_AD_ACCOUNT_ID na aba Configurações",
      ],
    });
  }

  if (totalHotmartSales > 0 && unattributedApproved.length / totalHotmartSales > 0.35) {
    alerts.push({
      id: "unattributed-sales",
      tone: "yellow",
      kind: "data_health",
      title: "Percentual relevante de vendas sem atribuição de campanha",
      metricInvolved: "Qualidade da Atribuição (Hotmart × Meta)",
      periodLabel,
      evidence: `${unattributedApproved.length} de ${totalHotmartSales} vendas aprovadas (${((unattributedApproved.length / totalHotmartSales) * 100).toFixed(0)}%) não possuem vínculo de sessão ou UTM com uma campanha.`,
      confidence: "alta",
      simpleExplanation: "Parte dos compradores comprou por tráfego direto/orgânico ou clicou em links de anúncios sem parâmetros UTM.",
      investigationActions: [
        "Padronize utm_source=meta&utm_campaign={{campaign.id}}&utm_content={{ad.id}} em todos os anúncios ativos",
        "Verifique na aba Hotmart & Atribuição quais produtos concentram vendas sem origem",
      ],
    });
  }

  for (const camp of campaignRows) {
    if ((camp.spend || 0) >= 80 && (camp.sales?.sales || 0) === 0) {
      alerts.push({
        id: `camp-no-sales-${camp.id}`,
        tone: "red",
        kind: "problem",
        title: `Campanha "${camp.name}" com gasto elevado e 0 vendas atribuídas`,
        metricInvolved: "Gasto vs Vendas atribuídas",
        periodLabel,
        evidence: `Investimento de R$ ${Number(camp.spend).toFixed(2)}, ${camp.link_clicks || 0} cliques no link e ${camp.site?.sessions || 0} sessões atribuídas sem venda vinculada.`,
        confidence: (camp.site?.sessions || 0) > 20 ? "alta" : "média",
        simpleExplanation: "Esta campanha está consumindo orçamento sem retorno atribuído confirmado no período.",
        investigationActions: [
          "Verifique se a campanha possui cliques que chegam à página e iniciam checkout",
          "Confirme se o link do anúncio contém campaign_id ou utm_campaign igual ao ID da campanha",
        ],
      });
    } else if ((camp.sales?.sales || 0) >= 2 && camp.result !== null && camp.result > 0) {
      alerts.push({
        id: `camp-winner-${camp.id}`,
        tone: "green",
        kind: "opportunity",
        title: `Campanha "${camp.name}" com retorno positivo após anúncios`,
        metricInvolved: "ROAS sobre comissão / Resultado líquido",
        periodLabel,
        evidence: `${camp.sales?.sales} vendas atribuídas, comissão de R$ ${Number(camp.sales?.commission || 0).toFixed(2)} para R$ ${Number(camp.spend || 0).toFixed(2)} investidos (ROAS comissão: ${camp.roasCommission?.toFixed(2)}×).`,
        confidence: (camp.sales?.sales || 0) >= 4 ? "alta" : "média",
        simpleExplanation: "As comissões geradas por esta campanha superam o valor gasto nos anúncios.",
        investigationActions: [
          "Analise quais conjuntos e criativos dentro desta campanha concentram as conversões",
          "Monitore a frequência para evitar saturação do público",
        ],
      });
    }
  }

  return {
    configState: metaConfigState(),
    accounts: accountsList.rows,
    account: account.rows[0] || null,
    sync: syncRow,
    syncHistory: syncHistory.rows,
    period,
    totals: {
      ...totalRow,
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      link_clicks: totalLinkClicks,
      outbound_clicks: totalOutboundClicks,
      cpm: accountCpm,
      ctr: ratio(totalClicks, totalImpressions),
      cpc: ratio(totalSpend, totalClicks),
      linkCtr: accountLinkCtr,
      linkCpc: accountLinkCpc,
      outboundCtr: ratio(totalOutboundClicks, totalImpressions),
      outboundCpc: ratio(totalSpend, totalOutboundClicks),
      extras: totalExtras,
      costPerSession: ratio(totalSpend, attributedSessionsCount || Number(siteRow.sessions || 0)),
      arrivalRate: ratio(
        attributedSessionsCount || Number(siteRow.sessions || 0),
        totalOutboundClicks || totalLinkClicks,
      ),
      attributedSessions: attributedSessionsCount,
      attributedCheckouts: attributedCheckoutsCount,
      attributedSales: attributedSalesCount,
      attributedRevenue,
      attributedCommission,
      cpaAttributed: ratio(totalSpend, attributedSalesCount),
      roasGrossAttributed: ratio(attributedRevenue, totalSpend),
      roasCommissionAttributed: ratio(attributedCommission, totalSpend),
      netResultAttributed: totalSpend !== null ? attributedCommission - totalSpend : null,
      cpaOverall: ratio(totalSpend, totalHotmartSales),
      roasGrossOverall: ratio(totalHotmartRevenue, totalSpend),
      roasCommissionOverall: ratio(totalHotmartCommission, totalSpend),
      netResultOverall: totalSpend !== null ? totalHotmartCommission - totalSpend : null,
      avgTicket: ratio(totalHotmartRevenue, totalHotmartSales),
      marginAfterAdsPct:
        totalSpend !== null && totalHotmartCommission > 0
          ? (totalHotmartCommission - totalSpend) / totalHotmartCommission
          : null,
    },
    previousTotals: {
      spend: prevSpend,
      impressions: prevImpressions,
      link_clicks: prevLinkClicks,
      linkCtr: ratio(prevLinkClicks, prevImpressions),
      linkCpc: ratio(prevSpend, prevLinkClicks),
    },
    conversionComparison: {
      metaReportedPurchases: totalExtras.metaPurchases,
      metaReportedRevenue: totalExtras.metaPurchaseValue,
      hotmartRealSales: totalHotmartSales,
      hotmartRealRevenue: totalHotmartRevenue,
      hotmartRealCommission: totalHotmartCommission,
      hotmartRefunds: totalHotmartRefunds,
      hotmartRefundedAmount: totalHotmartRefundedAmount,
      systemAttributedSales: attributedSalesCount,
      systemAttributedRevenue: attributedRevenue,
      systemAttributedCommission: attributedCommission,
      unattributedSales: unattributedApproved.length,
    },
    campaigns: campaignRows,
    adsets: adsetRows,
    ads: adRows,
    daily: daily.rows.filter((r) => r.level === "account"),
    allDaily: daily.rows,
    siteTotal: siteRow,
    hotmartTotal: hotmartRow,
    auditedSales,
    breakdowns: breakdowns.rows,
    stageDiagnostics,
    alerts,
    annotations: annotations.rows,
    financialPlans: plans.rows,
    experiments: experiments.rows.map((exp) => {
      const creativeItems = asArray(exp.creatives).map((cr) => {
        const ad = cr.ad_id ? adRows.find((a) => String(a.id) === String(cr.ad_id)) : null;
        return {
          ...cr,
          adName: ad?.name || null,
          spend: ad?.spend ?? null,
          impressions: ad?.impressions ?? null,
          linkClicks: ad?.link_clicks ?? null,
          linkCtr: ad?.linkCtr ?? null,
          linkCpc: ad?.linkCpc ?? null,
          sales: ad?.sales?.sales ?? 0,
          result: ad?.result ?? null,
        };
      });
      const totalExpImpressions = creativeItems.reduce((s, c) => s + Number(c.impressions || 0), 0);
      const totalExpClicks = creativeItems.reduce((s, c) => s + Number(c.linkClicks || 0), 0);
      return {
        ...exp,
        creatives: creativeItems,
        sufficientSample: totalExpImpressions >= 2000 && totalExpClicks >= 50,
      };
    }),
  };
}
