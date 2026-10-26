import { courseCatalog } from "@/lib/courseCatalog";
import { db } from "@/lib/db";
import { metaConfigState } from "@/lib/metaAds";
import { getMetaReport } from "@/lib/metaReport";
import { ensureAnalyticsSchema } from "@/lib/schemaGuard";

export type DashboardFilters = {
  days: number;
  pageKey: string | null;
  since?: string | null;
  until?: string | null;
};

const approvedSql = "(UPPER(COALESCE(status, '')) LIKE '%APPROV%' OR UPPER(COALESCE(status, '')) LIKE '%COMPLET%')";
const refundedSql = "(UPPER(COALESCE(status, '')) LIKE '%REFUND%' OR UPPER(COALESCE(status, '')) LIKE '%CHARGEBACK%')";
const cancelledSql = "(UPPER(COALESCE(status, '')) LIKE '%CANCEL%' OR UPPER(COALESCE(status, '')) LIKE '%EXPIRED%')";

export async function getDashboard(filters: DashboardFilters) {
  await ensureAnalyticsSchema();
  const days = Math.min(Math.max(filters.days || 30, 1), 365);
  const from = filters.since ? new Date(filters.since + "T00:00:00Z") : new Date(Date.now() - days * 86_400_000);
  const pageKey = filters.pageKey || null;
  const params = [from, pageKey];
  const eventWhere = "occurred_at >= $1 AND ($2::text IS NULL OR page_key = $2)";
  const saleWhere = "received_at >= $1 AND ($2::text IS NULL OR page_key = $2)";
  const currentSales = `WITH latest_sales AS (
    SELECT DISTINCT ON (COALESCE(transaction_id, provider_event_id)) *
    FROM hotmart_sales WHERE ${saleWhere}
    ORDER BY COALESCE(transaction_id, provider_event_id), updated_at DESC, received_at DESC
  )`;

  const [
    pages,
    summary,
    funnel,
    sources,
    daily,
    events,
    sales,
    pagePerformance,
    products,
    devices,
    browsers,
    systems,
    locations,
    pageQualityRows,
    buyerRows,
    offerRows,
    orderBumpRows,
    webhookHealth,
    metaReport,
  ] = await Promise.all([
    db.query("SELECT page_key, MAX(page_title) AS title FROM landing_events GROUP BY page_key ORDER BY page_key"),
    db.query(
      `${currentSales}
      SELECT
        (SELECT COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int FROM landing_events WHERE ${eventWhere}) AS page_views,
        (SELECT COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int FROM landing_events WHERE ${eventWhere}) AS unique_visitors,
        (SELECT COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int FROM landing_events WHERE ${eventWhere}) AS sessions,
        (SELECT COUNT(*) FILTER (WHERE event_type = 'VIEW_CONTENT')::int FROM landing_events WHERE ${eventWhere}) AS content_views,
        (SELECT COUNT(*) FILTER (WHERE event_type = 'OUTBOUND_CLICK')::int FROM landing_events WHERE ${eventWhere}) AS interactions,
        (SELECT COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int FROM landing_events WHERE ${eventWhere}) AS checkouts,
        COUNT(*) FILTER (WHERE ${approvedSql})::int AS purchases,
        COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue,
        COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS commission,
        COUNT(*) FILTER (WHERE ${refundedSql})::int AS refunds,
        COALESCE(SUM(amount) FILTER (WHERE ${refundedSql}), 0)::float AS refunded_amount,
        COUNT(*) FILTER (WHERE ${cancelledSql})::int AS cancellations
      FROM latest_sales`,
      params,
    ),
    db.query(`SELECT event_type, COUNT(*)::int AS total FROM landing_events WHERE ${eventWhere} GROUP BY event_type`, params),
    db.query(
      `SELECT COALESCE(utm_source, '(direto)') AS source, COALESCE(utm_medium, '-') AS medium,
        COALESCE(NULLIF(campaign_id, ''), COALESCE(utm_campaign, '-')) AS campaign,
        COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(*) FILTER (WHERE event_type IN ('VIEW_CONTENT', 'OUTBOUND_CLICK'))::int AS interactions,
        COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE ${eventWhere}
      GROUP BY utm_source, utm_medium, COALESCE(NULLIF(campaign_id, ''), COALESCE(utm_campaign, '-'))
      ORDER BY views DESC LIMIT 100`,
      params,
    ),
    db.query(
      `WITH event_days AS (
        SELECT DATE_TRUNC('day', occurred_at) AS day, COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
          COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
        FROM landing_events WHERE ${eventWhere} GROUP BY 1
      ), sale_days AS (
        SELECT DATE_TRUNC('day', received_at) AS day, COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales,
          COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue,
          COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS commission
        FROM hotmart_sales WHERE ${saleWhere} GROUP BY 1
      ) SELECT TO_CHAR(COALESCE(event_days.day, sale_days.day), 'YYYY-MM-DD') AS day,
        COALESCE(views, 0)::int AS views, COALESCE(checkouts, 0)::int AS checkouts,
        COALESCE(sales, 0)::int AS sales, COALESCE(revenue, 0)::float AS revenue,
        COALESCE(commission, 0)::float AS commission
      FROM event_days FULL OUTER JOIN sale_days ON event_days.day = sale_days.day
      ORDER BY COALESCE(event_days.day, sale_days.day)`,
      params,
    ),
    db.query(
      `SELECT event_type, page_key, session_id, visitor_id, journey_id, referrer, device_type, browser, os, country,
        region, city, utm_source, utm_campaign, campaign_id, adset_id, ad_id, checkout_url, metadata, occurred_at
      FROM landing_events WHERE ${eventWhere}
      ORDER BY occurred_at DESC LIMIT 100`,
      params,
    ),
    db.query(
      `SELECT event_name, status, transaction_id, product_id, product_name, offer_code, buyer_name, buyer_email, buyer_phone,
        amount::float, currency, payment_type, installments, producer_commission::float, page_key, session_id, journey_id,
        source_code, utm_source, utm_campaign, campaign_id, adset_id, ad_id, is_order_bump, parent_transaction_id,
        purchase_date, approved_date, received_at
      FROM hotmart_sales WHERE ${saleWhere}
      ORDER BY received_at DESC LIMIT 100`,
      params,
    ),
    db.query(
      `WITH page_events AS (
        SELECT page_key, MAX(page_title) AS title,
          COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
          COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS visitors,
          COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS sessions,
          COUNT(*) FILTER (WHERE event_type IN ('VIEW_CONTENT', 'OUTBOUND_CLICK'))::int AS interactions,
          COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
        FROM landing_events WHERE ${eventWhere} GROUP BY page_key
      ), page_sales AS (
        ${currentSales}
        SELECT page_key,
          COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales,
          COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue,
          COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS commission,
          COUNT(*) FILTER (WHERE ${refundedSql})::int AS refunds
        FROM latest_sales GROUP BY page_key
      )
      SELECT page_events.*,
        COALESCE(page_sales.sales, 0)::int AS sales,
        COALESCE(page_sales.revenue, 0)::float AS revenue,
        COALESCE(page_sales.commission, 0)::float AS commission,
        COALESCE(page_sales.refunds, 0)::int AS refunds
      FROM page_events LEFT JOIN page_sales USING (page_key)
      ORDER BY views DESC`,
      params,
    ),
    db.query(
      `${currentSales}
      SELECT COALESCE(NULLIF(product_name, ''), 'Produto não identificado') AS product,
        MAX(page_key) AS page_key,
        COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales,
        COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue,
        COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS commission,
        COUNT(*) FILTER (WHERE ${refundedSql})::int AS refunds,
        COUNT(*) FILTER (WHERE is_order_bump AND ${approvedSql})::int AS order_bumps
      FROM latest_sales GROUP BY product ORDER BY revenue DESC, sales DESC`,
      params,
    ),
    db.query(
      `SELECT COALESCE(NULLIF(device_type, ''), 'Não identificado') AS label, COUNT(*)::int AS value FROM landing_events
      WHERE ${eventWhere} AND event_type = 'PAGE_VIEW' GROUP BY 1 ORDER BY 2 DESC`,
      params,
    ),
    db.query(
      `SELECT COALESCE(NULLIF(browser, ''), 'Não identificado') AS label, COUNT(*)::int AS value FROM landing_events
      WHERE ${eventWhere} AND event_type = 'PAGE_VIEW' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      params,
    ),
    db.query(
      `SELECT COALESCE(NULLIF(os, ''), 'Não identificado') AS label, COUNT(*)::int AS value FROM landing_events
      WHERE ${eventWhere} AND event_type = 'PAGE_VIEW' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      params,
    ),
    db.query(
      `SELECT COALESCE(NULLIF(country, ''), 'Não identificado') AS country, COALESCE(NULLIF(region, ''), '-') AS region,
        COALESCE(NULLIF(city, ''), '-') AS city, COUNT(*)::int AS value FROM landing_events WHERE ${eventWhere}
      AND event_type = 'PAGE_VIEW' GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 20`,
      params,
    ),
    // Landing Page Quality (Core Web Vitals, load_ms, scroll_depth, JS errors, CTA clicks)
    db.query(
      `SELECT page_key,
        AVG((metadata->>'value')::float) FILTER (WHERE event_type = 'WEB_VITAL' AND metadata->>'metric' = 'lcp_ms')::float AS avg_lcp_ms,
        AVG((metadata->>'value')::float) FILTER (WHERE event_type = 'WEB_VITAL' AND metadata->>'metric' = 'cls')::float AS avg_cls,
        AVG((metadata->>'value')::float) FILTER (WHERE event_type = 'PAGE_QUALITY' AND metadata->>'metric' = 'load_ms')::float AS avg_load_ms,
        AVG((metadata->>'value')::float) FILTER (WHERE event_type = 'PAGE_QUALITY' AND metadata->>'metric' = 'scroll_depth')::float AS avg_scroll_depth,
        COUNT(*) FILTER (WHERE event_type = 'PAGE_QUALITY' AND metadata->>'metric' = 'javascript_error')::int AS js_errors,
        COUNT(*) FILTER (WHERE event_type = 'OUTBOUND_CLICK')::int AS cta_clicks,
        COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkout_clicks
      FROM landing_events WHERE ${eventWhere} GROUP BY page_key ORDER BY page_key`,
      params,
    ),
    // Buyer recurrence & LTV
    db.query(
      `${currentSales}
      SELECT
        LOWER(TRIM(COALESCE(NULLIF(buyer_email, ''), NULLIF(buyer_document, ''), transaction_id))) AS buyer_key,
        MAX(buyer_name) AS buyer_name,
        MAX(buyer_email) AS buyer_email,
        COUNT(*) FILTER (WHERE ${approvedSql})::int AS purchases_count,
        COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS total_spent,
        COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS total_commission,
        ARRAY_AGG(COALESCE(product_name, 'Produto') ORDER BY received_at ASC) FILTER (WHERE ${approvedSql}) AS products_sequence
      FROM latest_sales
      GROUP BY 1
      HAVING COUNT(*) FILTER (WHERE ${approvedSql}) > 0
      ORDER BY total_spent DESC LIMIT 100`,
      params,
    ),
    // Offers & discounts breakdown
    db.query(
      `${currentSales}
      SELECT
        COALESCE(NULLIF(offer_code, ''), 'Oferta padrão') AS offer_code,
        COALESCE(MAX(product_name), 'Produto') AS product_name,
        COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales,
        COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue,
        COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS commission,
        AVG(amount) FILTER (WHERE ${approvedSql})::float AS avg_price,
        COUNT(*) FILTER (WHERE ${refundedSql})::int AS refunds
      FROM latest_sales
      GROUP BY 1 ORDER BY revenue DESC`,
      params,
    ),
    // Order Bumps analysis
    db.query(
      `${currentSales}
      SELECT
        COALESCE(NULLIF(product_name, ''), 'Order Bump') AS bump_product,
        COUNT(*) FILTER (WHERE is_order_bump AND ${approvedSql})::int AS accepted_count,
        COALESCE(SUM(amount) FILTER (WHERE is_order_bump AND ${approvedSql}), 0)::float AS bump_revenue,
        COALESCE(SUM(producer_commission) FILTER (WHERE is_order_bump AND ${approvedSql}), 0)::float AS bump_commission
      FROM latest_sales
      WHERE is_order_bump = TRUE
      GROUP BY 1 ORDER BY bump_revenue DESC`,
      params,
    ),
    // Webhook & Data Health
    db.query(
      `SELECT
        MAX(received_at) AS last_webhook_at,
        COUNT(*)::int AS total_notifications,
        COUNT(DISTINCT COALESCE(transaction_id, provider_event_id))::int AS unique_transactions,
        COUNT(*) FILTER (WHERE session_id IS NULL AND journey_id IS NULL AND utm_campaign IS NULL AND campaign_id IS NULL)::int AS unattributed_notifications
      FROM hotmart_sales WHERE received_at >= $1`,
      [from],
    ),
    getMetaReport(days, undefined, { since: filters.since, until: filters.until }).catch(() => null),
  ]);

  const base = summary.rows[0] || {};
  const checkouts = Number(base.checkouts || 0);
  const views = Number(base.page_views || 0);
  const sessions = Number(base.sessions || 0);
  const purchases = Number(base.purchases || 0);
  const revenue = Number(base.revenue || 0);
  const commission = Number(base.commission || 0);
  const refunds = Number(base.refunds || 0);
  const refundedAmount = Number(base.refunded_amount || 0);
  const cancellations = Number(base.cancellations || 0);
  const counts = Object.fromEntries(funnel.rows.map((row) => [row.event_type, Number(row.total)]));

  // Merge catalog products with real performance
  const pagePerfMap = new Map(pagePerformance.rows.map((r) => [String(r.page_key), r]));
  const qualityMap = new Map(pageQualityRows.rows.map((r) => [String(r.page_key), r]));
  const catalogReport = courseCatalog.map((course) => {
    const slugKey = course.href.replace(/^\//, "");
    const perf =
      pagePerfMap.get(course.slug) ||
      pagePerfMap.get(slugKey) ||
      pagePerfMap.get(`curso-${course.slug}`) ||
      null;
    const prodMatch = products.rows.find(
      (p) =>
        String(p.page_key || "") === course.slug ||
        String(p.page_key || "") === slugKey ||
        String(p.product || "").toLowerCase().includes(course.title.toLowerCase().slice(0, 12)),
    );
    const visitors = Number(perf?.visitors || 0);
    const pageViews = Number(perf?.views || 0);
    const pageCheckouts = Number(perf?.checkouts || 0);
    const prodSales = Number(prodMatch?.sales ?? perf?.sales ?? 0);
    const prodRevenue = Number(prodMatch?.revenue ?? perf?.revenue ?? 0);
    const prodCommission = Number(prodMatch?.commission ?? perf?.commission ?? 0);
    const prodRefunds = Number(prodMatch?.refunds ?? perf?.refunds ?? 0);
    const prodOrderBumps = Number(prodMatch?.order_bumps || 0);
    const quality = qualityMap.get(course.slug) || qualityMap.get(slugKey) || null;
    return {
      slug: course.slug,
      title: course.title,
      price: course.price ?? 0,
      href: course.href,
      visitors,
      views: pageViews,
      checkouts: pageCheckouts,
      sales: prodSales,
      revenue: prodRevenue,
      commission: prodCommission,
      refunds: prodRefunds,
      orderBumps: prodOrderBumps,
      conversionRate: pageViews > 0 ? (prodSales / pageViews) * 100 : 0,
      checkoutRate: pageViews > 0 ? (pageCheckouts / pageViews) * 100 : 0,
      quality,
    };
  });

  // Buyer recurrence summary
  const allBuyers = buyerRows.rows;
  const firstTimeBuyers = allBuyers.filter((b) => Number(b.purchases_count) === 1).length;
  const repeatBuyers = allBuyers.filter((b) => Number(b.purchases_count) > 1).length;
  const avgLtv =
    allBuyers.length > 0
      ? allBuyers.reduce((sum, b) => sum + Number(b.total_spent || 0), 0) / allBuyers.length
      : 0;

  // Order bumps summary
  const totalBumpSales = orderBumpRows.rows.reduce((s, r) => s + Number(r.accepted_count || 0), 0);
  const totalBumpRevenue = orderBumpRows.rows.reduce((s, r) => s + Number(r.bump_revenue || 0), 0);
  const totalBumpCommission = orderBumpRows.rows.reduce((s, r) => s + Number(r.bump_commission || 0), 0);
  const mainSalesCount = Math.max(0, purchases - totalBumpSales);
  const mainRevenue = Math.max(0, revenue - totalBumpRevenue);
  const ticketWithoutBump = mainSalesCount > 0 ? mainRevenue / mainSalesCount : null;
  const ticketWithBump = mainSalesCount > 0 ? revenue / mainSalesCount : null;

  // Data Health summary
  const wh = webhookHealth.rows[0] || {};
  const totalNotif = Number(wh.total_notifications || 0);
  const uniqueTx = Number(wh.unique_transactions || 0);
  const duplicateWebhookEvents = Math.max(0, totalNotif - uniqueTx);
  const adsWithoutTracking = (metaReport?.ads || []).filter((a: any) => !a.hasTrackingParams).length;

  return {
    pages: pages.rows,
    sources: sources.rows,
    daily: daily.rows,
    events: events.rows,
    sales: sales.rows,
    pagePerformance: pagePerformance.rows,
    products: products.rows,
    catalogReport,
    devices: devices.rows,
    browsers: browsers.rows,
    systems: systems.rows,
    locations: locations.rows,
    pageQuality: pageQualityRows.rows,
    buyerIntelligence: {
      totalBuyers: allBuyers.length,
      firstTimeBuyers,
      repeatBuyers,
      repeatRatePct: allBuyers.length > 0 ? (repeatBuyers / allBuyers.length) * 100 : 0,
      avgLtv,
      topBuyers: allBuyers.slice(0, 25),
      offers: offerRows.rows,
    },
    orderBumps: {
      items: orderBumpRows.rows,
      totalAccepted: totalBumpSales,
      additionalRevenue: totalBumpRevenue,
      additionalCommission: totalBumpCommission,
      revenueSharePct: revenue > 0 ? (totalBumpRevenue / revenue) * 100 : 0,
      ticketWithoutBump,
      ticketWithBump,
    },
    dataHealth: {
      metaConfig: metaConfigState(),
      lastMetaSync: metaReport?.sync || null,
      lastHotmartWebhookAt: wh.last_webhook_at || null,
      totalHotmartNotifications: totalNotif,
      uniqueHotmartTransactions: uniqueTx,
      duplicateWebhookEvents,
      unattributedSalesCount: metaReport?.conversionComparison?.unattributedSales ?? 0,
      unattributedSalesPct:
        purchases > 0
          ? ((metaReport?.conversionComparison?.unattributedSales ?? 0) / purchases) * 100
          : 0,
      adsWithoutTrackingCount: adsWithoutTracking,
      accountTimezone: metaReport?.account?.timezone_name || "America/Sao_Paulo",
      accountCurrency: metaReport?.account?.currency || "BRL",
    },
    meta: metaReport,
    summary: {
      pageViews: views,
      uniqueVisitors: Number(base.unique_visitors || 0),
      sessions,
      contentViews: Number(base.content_views || 0),
      interactions: Number(base.interactions || 0),
      checkouts,
      purchases,
      revenue,
      commission,
      netAdjustedRevenue: Math.max(0, revenue - refundedAmount),
      refunds,
      refundedAmount,
      cancellations,
      checkoutRate: views ? (checkouts / views) * 100 : 0,
      sessionCheckoutRate: sessions ? (checkouts / sessions) * 100 : 0,
      purchaseRate: checkouts ? (purchases / checkouts) * 100 : 0,
      siteConversionRate: sessions ? (purchases / sessions) * 100 : 0,
      avgTicket: purchases ? revenue / purchases : 0,
    },
    funnel: [
      { label: "Visualizações de página", event: "PAGE_VIEW", value: Number(counts.PAGE_VIEW || 0) },
      { label: "Leitura de conteúdo", event: "VIEW_CONTENT", value: Number(counts.VIEW_CONTENT || 0) },
      { label: "Cliques em CTAs / Interações", event: "OUTBOUND_CLICK", value: Number(counts.OUTBOUND_CLICK || 0) },
      { label: "Inícios de checkout", event: "INITIATE_CHECKOUT", value: checkouts },
      { label: "Vendas aprovadas (Hotmart)", event: "PURCHASE", value: purchases },
    ],
  };
}
