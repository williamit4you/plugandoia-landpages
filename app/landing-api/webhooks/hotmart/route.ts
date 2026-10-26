import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { number, text } from "@/lib/requestAnalytics";
import { ensureAnalyticsSchema } from "@/lib/schemaGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameToken(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function dateOrNull(value: unknown) {
  if (!value) return null;
  const numeric = Number(value);
  const date =
    Number.isFinite(numeric) && String(value).length >= 10
      ? new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric)
      : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function approved(eventName: string, status: string) {
  const value = `${eventName} ${status}`.toUpperCase();
  return value.includes("APPROVED") || value.includes("COMPLETED") || value.includes("COMPLETE");
}

export async function POST(request: NextRequest) {
  try {
    await ensureAnalyticsSchema();
    const contentType = request.headers.get("content-type") || "";
    const payload: any = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const expectedToken = String(process.env.HOTMART_WEBHOOK_TOKEN || "").trim().replace(/^["']|["']$/g, "");
    const suppliedToken =
      text(request.headers.get("x-hotmart-hottok") || payload.hottok || payload.data?.hottok, 500) || "";

    if (!expectedToken || !sameToken(suppliedToken, expectedToken)) {
      return NextResponse.json({ error: "Webhook não autorizado" }, { status: 401 });
    }

    const data = payload.data || payload;
    const purchase = data.purchase || data;
    const buyer = data.buyer || purchase.buyer || {};
    const product = data.product || purchase.product || {};
    const price = purchase.price || purchase.full_price || data.price || {};
    const payment = purchase.payment || data.payment || {};
    const tracking = purchase.tracking || data.tracking || {};
    const orderBump = purchase.order_bump || data.order_bump || {};
    const eventName = text(payload.event || payload.event_type || data.event, 120) || "UNKNOWN";
    const status = text(purchase.status || data.status || eventName, 120);
    const transactionId = text(purchase.transaction || purchase.transaction_id || data.transaction, 255);
    const providerEventId = text(payload.id || payload.event_id, 255) || `${transactionId || "unknown"}:${eventName}`;
    const sourceCode = text(tracking.source || tracking.src || purchase.src || tracking.xcod || purchase.xcod, 255);
    const sessionId =
      text(tracking.session_id, 160) || (sourceCode?.startsWith("lp_") ? sourceCode.slice(3) : null);
    const journeyId =
      text(tracking.journey_id || tracking.journey || purchase.journey_id, 160) ||
      (sourceCode?.startsWith("jrny_") ? sourceCode : null);
    let pageKey = text(tracking.sck || tracking.source_sck || purchase.sck, 120);
    let visitorId = text(tracking.visitor_id, 160);
    let utmSource = text(tracking.utm_source, 255);
    let utmMedium = text(tracking.utm_medium, 255);
    let utmCampaign = text(tracking.utm_campaign, 255);
    let utmTerm = text(tracking.utm_term, 255);
    let utmContent = text(tracking.utm_content, 255);
    let campaignId = text(tracking.campaign_id, 160);
    let adsetId = text(tracking.adset_id, 160);
    let adId = text(tracking.ad_id, 160);

    // Enrich missing attribution from first-party session/journey when available
    if (sessionId || journeyId) {
      const originQuery = await db.query(
        `SELECT page_key, visitor_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
                campaign_id, adset_id, ad_id, journey_id, session_id
         FROM landing_events
         WHERE ($1::text IS NOT NULL AND session_id = $1)
            OR ($2::text IS NOT NULL AND journey_id = $2)
         ORDER BY (event_type = 'PAGE_VIEW') DESC, occurred_at ASC
         LIMIT 1`,
        [sessionId, journeyId],
      );
      const origin = originQuery.rows[0];
      if (origin) {
        pageKey = pageKey || origin.page_key;
        visitorId = visitorId || origin.visitor_id;
        utmSource = utmSource || origin.utm_source;
        utmMedium = utmMedium || origin.utm_medium;
        utmCampaign = utmCampaign || origin.utm_campaign;
        utmTerm = utmTerm || origin.utm_term;
        utmContent = utmContent || origin.utm_content;
        campaignId = campaignId || origin.campaign_id;
        adsetId = adsetId || origin.adset_id;
        adId = adId || origin.ad_id;
      }
    }

    const isOrderBump = Boolean(
      orderBump?.is_order_bump === true ||
        String(orderBump?.is_order_bump).toLowerCase() === "true" ||
        purchase?.is_order_bump === true,
    );
    const parentTransactionId = text(
      orderBump?.parent_purchase_transaction ||
        orderBump?.parent_transaction ||
        purchase?.parent_transaction,
      255,
    );

    const commissions = Array.isArray(purchase.commissions || data.commissions)
      ? purchase.commissions || data.commissions
      : [];
    const producerCommission = commissions.reduce((sum: number, item: any) => {
      const type = String(item?.source || item?.type || "").toUpperCase();
      return type.includes("PRODUCER") ? sum + Number(item?.value || 0) : sum;
    }, 0);

    const values = [
      randomUUID(),
      providerEventId,
      eventName,
      status,
      transactionId,
      text(product.id || product.ucode, 255),
      text(product.name, 500),
      text(purchase.offer?.code || purchase.offer_code || data.offer?.code, 255),
      text(buyer.name, 255),
      text(buyer.email, 320),
      text(buyer.phone || buyer.phone_number || buyer.checkout_phone, 100),
      text(buyer.document || buyer.doc, 120),
      number(price.value || purchase.price_value || purchase.value),
      text(price.currency_value || price.currency || purchase.currency, 20),
      text(payment.type || purchase.payment_type, 120),
      number(payment.installments_number || purchase.installments),
      producerCommission || number(purchase.producer_commission) || null,
      dateOrNull(purchase.order_date || purchase.purchase_date || data.purchase_date),
      dateOrNull(purchase.approved_date || purchase.confirmation_purchase_date || data.confirmation_purchase_date),
      pageKey,
      sessionId,
      visitorId,
      sourceCode,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      journeyId,
      campaignId,
      adsetId,
      adId,
      isOrderBump,
      parentTransactionId,
      JSON.stringify(payload),
    ];

    await db.query(
      `INSERT INTO hotmart_sales (
        id, provider_event_id, event_name, status, transaction_id, product_id, product_name,
        offer_code, buyer_name, buyer_email, buyer_phone, buyer_document, amount, currency,
        payment_type, installments, producer_commission, purchase_date, approved_date,
        page_key, session_id, visitor_id, source_code, utm_source, utm_medium,
        utm_campaign, utm_term, utm_content, journey_id, campaign_id, adset_id, ad_id,
        is_order_bump, parent_transaction_id, raw_payload
      ) VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})
      ON CONFLICT (provider_event_id) DO UPDATE SET
        event_name = EXCLUDED.event_name,
        status = EXCLUDED.status,
        transaction_id = EXCLUDED.transaction_id,
        product_name = EXCLUDED.product_name,
        offer_code = COALESCE(EXCLUDED.offer_code, hotmart_sales.offer_code),
        buyer_name = EXCLUDED.buyer_name,
        buyer_email = EXCLUDED.buyer_email,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        producer_commission = COALESCE(EXCLUDED.producer_commission, hotmart_sales.producer_commission),
        journey_id = COALESCE(EXCLUDED.journey_id, hotmart_sales.journey_id),
        campaign_id = COALESCE(EXCLUDED.campaign_id, hotmart_sales.campaign_id),
        adset_id = COALESCE(EXCLUDED.adset_id, hotmart_sales.adset_id),
        ad_id = COALESCE(EXCLUDED.ad_id, hotmart_sales.ad_id),
        is_order_bump = EXCLUDED.is_order_bump,
        parent_transaction_id = COALESCE(EXCLUDED.parent_transaction_id, hotmart_sales.parent_transaction_id),
        raw_payload = EXCLUDED.raw_payload,
        updated_at = NOW()`,
      values,
    );

    if (approved(eventName, status || "") && sessionId) {
      await db.query(
        `INSERT INTO landing_events (
          id, page_key, page_path, event_type, session_id, visitor_id, currency,
          value, order_id, campaign_id, adset_id, ad_id, journey_id, metadata
        ) VALUES ($1, $2, $3, 'PURCHASE', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT DO NOTHING`,
        [
          randomUUID(),
          pageKey || "hotmart",
          pageKey ? `/${pageKey}` : "/",
          sessionId,
          visitorId,
          text(price.currency_value || price.currency, 20),
          number(price.value || purchase.value),
          transactionId,
          campaignId,
          adsetId,
          adId,
          journeyId,
          JSON.stringify({ provider: "hotmart", eventName, isOrderBump, parentTransactionId }),
        ],
      );
    }

    if (approved(eventName, status || "")) {
      const buyerName = text(buyer.name, 255) || "";
      const buyerNameParts = buyerName.trim().split(/\s+/).filter(Boolean);
      const publicSiteUrl = (process.env.PUBLIC_SITE_URL || "https://plugandoia.cloud").replace(/\/$/, "");
      const approvedAt = dateOrNull(
        purchase.approved_date || purchase.confirmation_purchase_date || data.confirmation_purchase_date,
      );
      await sendMetaCapiEvent({
        eventName: "Purchase",
        eventId: `hotmart_${transactionId || providerEventId}`,
        eventSourceUrl: pageKey ? `${publicSiteUrl}/${pageKey.replace(/^\//, "")}` : publicSiteUrl,
        eventTime: approvedAt ? Math.floor(approvedAt.getTime() / 1000) : undefined,
        visitorId: visitorId || sessionId,
        email: text(buyer.email, 320),
        phone: text(buyer.phone || buyer.phone_number, 100),
        firstName: buyerNameParts[0],
        lastName: buyerNameParts.length > 1 ? buyerNameParts[buyerNameParts.length - 1] : null,
        currency: text(price.currency_value || price.currency || purchase.currency, 20),
        value: number(price.value || purchase.price_value || purchase.value),
        contentId: text(product.id || product.ucode, 255),
        contentName: text(product.name, 500),
        contentType: "product",
        orderId: transactionId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[hotmart webhook]", error);
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 });
  }
}
