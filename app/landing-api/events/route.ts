import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMetaCapiEvent, type MetaCapiEventName } from "@/lib/metaCapi";
import { browserFromUa, clientIp, deviceFromUa, ipHash, number, osFromUa, text } from "@/lib/requestAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedEvents = new Set(["PAGE_VIEW", "VIEW_CONTENT", "INITIATE_CHECKOUT", "OUTBOUND_CLICK", "LEAD", "PURCHASE"]);
const metaEvents: Partial<Record<string, MetaCapiEventName>> = {
  PAGE_VIEW: "PageView",
  VIEW_CONTENT: "ViewContent",
  INITIATE_CHECKOUT: "InitiateCheckout",
  LEAD: "Lead",
  PURCHASE: "Purchase",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = text(body.eventType, 80);
    const pageKey = text(body.pageKey, 120);
    const pagePath = text(body.pagePath, 255);
    const sessionId = text(body.sessionId, 160);
    if (!eventType || !allowedEvents.has(eventType) || !pageKey || !pagePath || !sessionId) {
      return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
    }

    const userAgent = text(body.userAgent || request.headers.get("user-agent"), 800);
    const eventId = text(body.eventId, 255) || randomUUID();
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const values = [
      randomUUID(), pageKey, pagePath, text(body.pageTitle, 255), eventType, sessionId,
      text(body.visitorId, 160), text(body.referrer, 1000), text(body.landingUrl, 1500), userAgent,
      ipHash(request), deviceFromUa(userAgent), browserFromUa(userAgent), osFromUa(userAgent),
      text(request.headers.get("cf-ipcountry") || request.headers.get("x-country"), 80),
      text(request.headers.get("x-region"), 120), text(request.headers.get("x-city"), 120),
      text(body.utmSource, 255), text(body.utmMedium, 255), text(body.utmCampaign, 255),
      text(body.utmTerm, 255), text(body.utmContent, 255), text(body.fbclid, 255), text(body.gclid, 255),
      text(body.checkoutUrl, 1500), text(body.currency, 20), number(body.value), text(body.orderId, 160),
      JSON.stringify(metadata),
    ];

    await db.query(
      `INSERT INTO landing_events (
        id, page_key, page_path, page_title, event_type, session_id, visitor_id,
        referrer, landing_url, user_agent, ip_hash, device_type, browser, os,
        country, region, city, utm_source, utm_medium, utm_campaign, utm_term,
        utm_content, fbclid, gclid, checkout_url, currency, value, order_id, metadata
      ) VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})`,
      values,
    );

    const metaEventName = metaEvents[eventType];
    if (metaEventName) {
      const fbclid = text(body.fbclid, 255);
      void sendMetaCapiEvent({
        eventName: metaEventName,
        eventId,
        eventSourceUrl: text(body.landingUrl, 1500),
        clientIp: clientIp(request),
        userAgent,
        fbp: text(body.fbp, 255),
        fbc: text(body.fbc, 255) || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : null),
        visitorId: text(body.visitorId, 160),
        currency: text(body.currency, 20),
        value: number(body.value),
        contentId: pageKey,
        contentName: text(metadata.contentName || metadata.offerName || body.pageTitle, 500),
        contentType: text(metadata.contentType, 120) || "product",
        orderId: text(body.orderId, 160),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[landing event]", error);
    return NextResponse.json({ error: "Falha ao registrar evento" }, { status: 500 });
  }
}
