import { db } from "@/lib/db";

export type DashboardFilters = { days: number; pageKey: string | null };

const approvedSql = "(UPPER(COALESCE(status, '')) LIKE '%APPROV%' OR UPPER(COALESCE(status, '')) LIKE '%COMPLET%')";
const refundedSql = "(UPPER(COALESCE(status, '')) LIKE '%REFUND%' OR UPPER(COALESCE(status, '')) LIKE '%CHARGEBACK%')";

export async function getDashboard(filters: DashboardFilters) {
  const days = Math.min(Math.max(filters.days || 30, 1), 365);
  const from = new Date(Date.now() - days * 86_400_000);
  const pageKey = filters.pageKey || null;
  const params = [from, pageKey];
  const eventWhere = "occurred_at >= $1 AND ($2::text IS NULL OR page_key = $2)";
  const saleWhere = "received_at >= $1 AND ($2::text IS NULL OR page_key = $2)";
  const currentSales = `WITH latest_sales AS (
    SELECT DISTINCT ON (COALESCE(transaction_id, provider_event_id)) *
    FROM hotmart_sales WHERE ${saleWhere}
    ORDER BY COALESCE(transaction_id, provider_event_id), updated_at DESC
  )`;

  const [pages, summary, funnel, sources, daily, events, sales, pagePerformance, products, devices, browsers, systems, locations] = await Promise.all([
    db.query("SELECT page_key, MAX(page_title) AS title FROM landing_events GROUP BY page_key ORDER BY page_key"),
    db.query(`${currentSales}
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
        COUNT(*) FILTER (WHERE ${refundedSql})::int AS refunds
      FROM latest_sales`,
      params,
    ),
    db.query(`SELECT event_type, COUNT(*)::int AS total FROM landing_events WHERE ${eventWhere} GROUP BY event_type`, params),
    db.query(`SELECT COALESCE(utm_source, '(direto)') AS source, COALESCE(utm_medium, '-') AS medium,
      COALESCE(utm_campaign, '-') AS campaign, COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
      COUNT(DISTINCT session_id)::int AS sessions, COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE ${eventWhere} GROUP BY utm_source, utm_medium, utm_campaign ORDER BY views DESC LIMIT 100`, params),
    db.query(`WITH event_days AS (
        SELECT DATE_TRUNC('day', occurred_at) AS day, COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
          COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
        FROM landing_events WHERE ${eventWhere} GROUP BY 1
      ), sale_days AS (
        SELECT DATE_TRUNC('day', received_at) AS day, COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales,
          COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue
        FROM hotmart_sales WHERE ${saleWhere} GROUP BY 1
      ) SELECT TO_CHAR(COALESCE(event_days.day, sale_days.day), 'YYYY-MM-DD') AS day,
        COALESCE(views, 0)::int AS views, COALESCE(checkouts, 0)::int AS checkouts,
        COALESCE(sales, 0)::int AS sales, COALESCE(revenue, 0)::float AS revenue
      FROM event_days FULL OUTER JOIN sale_days ON event_days.day = sale_days.day ORDER BY COALESCE(event_days.day, sale_days.day)`, params),
    db.query(`SELECT event_type, page_key, session_id, visitor_id, referrer, device_type, browser, os, country,
      region, city, utm_source, utm_campaign, checkout_url, metadata, occurred_at FROM landing_events WHERE ${eventWhere}
      ORDER BY occurred_at DESC LIMIT 100`, params),
    db.query(`SELECT event_name, status, transaction_id, product_name, buyer_name, buyer_email, buyer_phone,
      amount::float, currency, payment_type, installments, producer_commission::float, page_key, source_code,
      utm_source, utm_campaign, purchase_date, approved_date, received_at FROM hotmart_sales WHERE ${saleWhere}
      ORDER BY received_at DESC LIMIT 100`, params),
    db.query(`WITH page_events AS (
      SELECT page_key, MAX(page_title) AS title, COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS visitors,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS sessions,
        COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE ${eventWhere} GROUP BY page_key
    ), page_sales AS (${currentSales} SELECT page_key, COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales FROM latest_sales GROUP BY page_key)
    SELECT page_events.*, COALESCE(page_sales.sales, 0)::int AS sales FROM page_events LEFT JOIN page_sales USING (page_key)
    ORDER BY views DESC`, params),
    db.query(`${currentSales} SELECT COALESCE(NULLIF(product_name, ''), 'Produto não identificado') AS product,
      COUNT(*) FILTER (WHERE ${approvedSql})::int AS sales, COALESCE(SUM(amount) FILTER (WHERE ${approvedSql}), 0)::float AS revenue,
      COALESCE(SUM(producer_commission) FILTER (WHERE ${approvedSql}), 0)::float AS commission,
      COUNT(*) FILTER (WHERE ${refundedSql})::int AS refunds
      FROM latest_sales GROUP BY product ORDER BY revenue DESC, sales DESC`, params),
    db.query(`SELECT COALESCE(NULLIF(device_type, ''), 'Não identificado') AS label, COUNT(*)::int AS value FROM landing_events
      WHERE ${eventWhere} AND event_type = 'PAGE_VIEW' GROUP BY 1 ORDER BY 2 DESC`, params),
    db.query(`SELECT COALESCE(NULLIF(browser, ''), 'Não identificado') AS label, COUNT(*)::int AS value FROM landing_events
      WHERE ${eventWhere} AND event_type = 'PAGE_VIEW' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, params),
    db.query(`SELECT COALESCE(NULLIF(os, ''), 'Não identificado') AS label, COUNT(*)::int AS value FROM landing_events
      WHERE ${eventWhere} AND event_type = 'PAGE_VIEW' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, params),
    db.query(`SELECT COALESCE(NULLIF(country, ''), 'Não identificado') AS country, COALESCE(NULLIF(region, ''), '-') AS region,
      COALESCE(NULLIF(city, ''), '-') AS city, COUNT(*)::int AS value FROM landing_events WHERE ${eventWhere}
      AND event_type = 'PAGE_VIEW' GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 20`, params),
  ]);

  const base = summary.rows[0] || {};
  const checkouts = Number(base.checkouts || 0);
  const views = Number(base.page_views || 0);
  const purchases = Number(base.purchases || 0);
  const counts = Object.fromEntries(funnel.rows.map((row) => [row.event_type, Number(row.total)]));
  return {
    pages: pages.rows, sources: sources.rows, daily: daily.rows, events: events.rows, sales: sales.rows,
    pagePerformance: pagePerformance.rows, products: products.rows, devices: devices.rows, browsers: browsers.rows, systems: systems.rows, locations: locations.rows,
    summary: { pageViews: views, uniqueVisitors: Number(base.unique_visitors || 0), sessions: Number(base.sessions || 0), contentViews: Number(base.content_views || 0), interactions: Number(base.interactions || 0), checkouts, purchases, revenue: Number(base.revenue || 0), commission: Number(base.commission || 0), refunds: Number(base.refunds || 0), checkoutRate: views ? (checkouts / views) * 100 : 0, purchaseRate: checkouts ? (purchases / checkouts) * 100 : 0 },
    funnel: [
      { label: "Visualizações", event: "PAGE_VIEW", value: Number(counts.PAGE_VIEW || 0) },
      { label: "Conteúdo", event: "VIEW_CONTENT", value: Number(counts.VIEW_CONTENT || 0) },
      { label: "Checkout", event: "INITIATE_CHECKOUT", value: checkouts },
      { label: "Vendas", event: "PURCHASE", value: purchases },
    ],
  };
}
