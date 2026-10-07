import { db } from "@/lib/db";

export type DashboardFilters = { days: number; pageKey: string | null };

export async function getDashboard(filters: DashboardFilters) {
  const days = Math.min(Math.max(filters.days || 30, 1), 365);
  const from = new Date(Date.now() - days * 86_400_000);
  const pageKey = filters.pageKey || null;
  const params = [from, pageKey];
  const eventWhere = `occurred_at >= $1 AND ($2::text IS NULL OR page_key = $2)`;
  const saleWhere = `received_at >= $1 AND ($2::text IS NULL OR page_key = $2)`;

  const [pages, summary, salesSummary, funnel, sources, daily, events, sales] = await Promise.all([
    db.query(`SELECT page_key, MAX(page_title) AS title FROM landing_events GROUP BY page_key ORDER BY page_key`),
    db.query(
      `SELECT
        COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS page_views,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS unique_visitors,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS sessions,
        COUNT(*) FILTER (WHERE event_type = 'VIEW_CONTENT')::int AS content_views,
        COUNT(*) FILTER (WHERE event_type = 'OUTBOUND_CLICK')::int AS interactions,
        COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
      FROM landing_events WHERE ${eventWhere}`,
      params,
    ),
    db.query(
      `WITH approved AS (
        SELECT DISTINCT ON (COALESCE(transaction_id, provider_event_id)) *
        FROM hotmart_sales
        WHERE ${saleWhere}
          AND (UPPER(COALESCE(status, '')) LIKE '%APPROV%' OR UPPER(COALESCE(status, '')) LIKE '%COMPLET%')
        ORDER BY COALESCE(transaction_id, provider_event_id), updated_at DESC
      )
      SELECT COUNT(*)::int AS purchases, COALESCE(SUM(amount), 0)::float AS revenue,
        COALESCE(SUM(producer_commission), 0)::float AS commission
      FROM approved`,
      params,
    ),
    db.query(
      `SELECT event_type, COUNT(*)::int AS total
       FROM landing_events WHERE ${eventWhere}
       GROUP BY event_type`,
      params,
    ),
    db.query(
      `SELECT COALESCE(utm_source, '(direto)') AS source,
        COALESCE(utm_medium, '-') AS medium,
        COALESCE(utm_campaign, '-') AS campaign,
        COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
        COUNT(DISTINCT session_id)::int AS sessions,
        COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
       FROM landing_events WHERE ${eventWhere}
       GROUP BY utm_source, utm_medium, utm_campaign
       ORDER BY views DESC LIMIT 50`,
      params,
    ),
    db.query(
      `SELECT TO_CHAR(DATE_TRUNC('day', occurred_at), 'YYYY-MM-DD') AS day,
        COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')::int AS views,
        COUNT(*) FILTER (WHERE event_type = 'INITIATE_CHECKOUT')::int AS checkouts
       FROM landing_events WHERE ${eventWhere}
       GROUP BY DATE_TRUNC('day', occurred_at) ORDER BY DATE_TRUNC('day', occurred_at)`,
      params,
    ),
    db.query(
      `SELECT event_type, page_key, session_id, visitor_id, referrer, device_type,
        browser, os, country, utm_source, utm_campaign, checkout_url, metadata, occurred_at
       FROM landing_events WHERE ${eventWhere}
       ORDER BY occurred_at DESC LIMIT 100`,
      params,
    ),
    db.query(
      `SELECT event_name, status, transaction_id, product_name, buyer_name, buyer_email,
        buyer_phone, amount::float, currency, payment_type, installments,
        producer_commission::float, page_key, source_code, utm_source, utm_campaign,
        purchase_date, approved_date, received_at
       FROM hotmart_sales WHERE ${saleWhere}
       ORDER BY received_at DESC LIMIT 100`,
      params,
    ),
  ]);

  const base = summary.rows[0] || {};
  const money = salesSummary.rows[0] || {};
  const checkouts = Number(base.checkouts || 0);
  const views = Number(base.page_views || 0);
  const purchases = Number(money.purchases || 0);
  const counts = Object.fromEntries(funnel.rows.map((row) => [row.event_type, Number(row.total)]));

  return {
    pages: pages.rows,
    summary: {
      pageViews: views,
      uniqueVisitors: Number(base.unique_visitors || 0),
      sessions: Number(base.sessions || 0),
      contentViews: Number(base.content_views || 0),
      interactions: Number(base.interactions || 0),
      checkouts,
      purchases,
      revenue: Number(money.revenue || 0),
      commission: Number(money.commission || 0),
      checkoutRate: views ? (checkouts / views) * 100 : 0,
      purchaseRate: checkouts ? (purchases / checkouts) * 100 : 0,
    },
    funnel: [
      { label: "Visualizações", value: Number(counts.PAGE_VIEW || 0) },
      { label: "Conteúdo", value: Number(counts.VIEW_CONTENT || 0) },
      { label: "Checkout", value: checkouts },
      { label: "Vendas", value: purchases },
    ],
    sources: sources.rows,
    daily: daily.rows,
    events: events.rows,
    sales: sales.rows,
  };
}
