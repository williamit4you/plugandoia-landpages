import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { number, text } from "@/lib/requestAnalytics";

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
  const date = Number.isFinite(numeric) && String(value).length >= 10
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
    const contentType = request.headers.get("content-type") || "";
    const payload: any = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const expectedToken = process.env.HOTMART_WEBHOOK_TOKEN || "";
    const suppliedToken = text(
      request.headers.get("x-hotmart-hottok") || payload.hottok || payload.data?.hottok,
      500,
    ) || "";

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
    const eventName = text(payload.event || payload.event_type || data.event, 120) || "UNKNOWN";
    const status = text(purchase.status || data.status || eventName, 120);
    const transactionId = text(purchase.transaction || purchase.transaction_id || data.transaction, 255);
    const providerEventId = text(payload.id || payload.event_id, 255) || `${transactionId || "unknown"}:${eventName}`;
    const sourceCode = text(tracking.source || tracking.src || purchase.src, 255);
    const sessionId = sourceCode?.startsWith("lp_") ? sourceCode.slice(3) : null;
    const pageKey = text(tracking.sck || tracking.source_sck || purchase.sck, 120);
    const commissions = Array.isArray(purchase.commissions || data.commissions) ? (purchase.commissions || data.commissions) : [];
    const producerCommission = commissions.reduce((sum: number, item: any) => {
      const type = String(item?.source || item?.type || "").toUpperCase();
      return type.includes("PRODUCER") ? sum + Number(item?.value || 0) : sum;
    }, 0);

    const values = [
      randomUUID(), providerEventId, eventName, status, transactionId,
      text(product.id || product.ucode, 255), text(product.name, 500), text(purchase.offer?.code || purchase.offer_code, 255),
      text(buyer.name, 255), text(buyer.email, 320), text(buyer.phone || buyer.phone_number, 100), text(buyer.document || buyer.doc, 120),
      number(price.value || purchase.price_value || purchase.value), text(price.currency_value || price.currency || purchase.currency, 20),
      text(payment.type || purchase.payment_type, 120), number(payment.installments_number || purchase.installments), producerCommission || null,
      dateOrNull(purchase.order_date || purchase.purchase_date || data.purchase_date),
      dateOrNull(purchase.approved_date || purchase.confirmation_purchase_date || data.confirmation_purchase_date),
      pageKey, sessionId, text(tracking.visitor_id, 160), sourceCode,
      text(tracking.utm_source, 255), text(tracking.utm_medium, 255), text(tracking.utm_campaign, 255),
      text(tracking.utm_term, 255), text(tracking.utm_content, 255), JSON.stringify(payload),
    ];

    await db.query(
      `INSERT INTO hotmart_sales (
        id, provider_event_id, event_name, status, transaction_id, product_id, product_name,
        offer_code, buyer_name, buyer_email, buyer_phone, buyer_document, amount, currency,
        payment_type, installments, producer_commission, purchase_date, approved_date,
        page_key, session_id, visitor_id, source_code, utm_source, utm_medium,
        utm_campaign, utm_term, utm_content, raw_payload
      ) VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})
      ON CONFLICT (provider_event_id) DO UPDATE SET
        event_name = EXCLUDED.event_name, status = EXCLUDED.status,
        transaction_id = EXCLUDED.transaction_id, product_name = EXCLUDED.product_name,
        buyer_name = EXCLUDED.buyer_name, buyer_email = EXCLUDED.buyer_email,
        amount = EXCLUDED.amount, currency = EXCLUDED.currency,
        raw_payload = EXCLUDED.raw_payload, updated_at = NOW()`,
      values,
    );

    if (approved(eventName, status || "") && sessionId) {
      await db.query(
        `INSERT INTO landing_events (
          id, page_key, page_path, event_type, session_id, visitor_id, currency,
          value, order_id, metadata
        ) VALUES ($1, $2, $3, 'PURCHASE', $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING`,
        [randomUUID(), pageKey || "hotmart", pageKey ? `/${pageKey}` : "/", sessionId,
          text(tracking.visitor_id, 160), text(price.currency_value || price.currency, 20),
          number(price.value || purchase.value), transactionId, JSON.stringify({ provider: "hotmart", eventName })],
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[hotmart webhook]", error);
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 });
  }
}
