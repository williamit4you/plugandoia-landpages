import { createHash } from "node:crypto";

export type MetaCapiEventName = "PageView" | "ViewContent" | "InitiateCheckout" | "Lead" | "Purchase";

type MetaCapiInput = {
  eventName: MetaCapiEventName;
  eventId: string;
  eventSourceUrl?: string | null;
  eventTime?: number;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  visitorId?: string | null;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  currency?: string | null;
  value?: number | null;
  contentId?: string | null;
  contentName?: string | null;
  contentType?: string | null;
  orderId?: string | null;
};

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== ""));
}

function normalize(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hash(value: string | null | undefined, mode: "text" | "phone" = "text") {
  const normalized = mode === "phone" ? String(value || "").replace(/\D/g, "") : normalize(value);
  return normalized ? createHash("sha256").update(normalized).digest("hex") : null;
}

function hashed(value: string | null | undefined, mode: "text" | "phone" = "text") {
  const result = hash(value, mode);
  return result ? [result] : undefined;
}

export async function sendMetaCapiEvent(input: MetaCapiInput) {
  const pixelId = process.env.META_PIXEL_ID?.trim() || process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token) return { sent: false, reason: "not_configured" as const };

  const version = /^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION || "")
    ? process.env.META_GRAPH_API_VERSION!
    : "v26.0";
  const names = normalize(input.firstName).split(/\s+/).filter(Boolean);
  const firstName = input.firstName || names[0];
  const lastName = input.lastName || (names.length > 1 ? names[names.length - 1] : null);

  const userData = compact({
    client_ip_address: input.clientIp,
    client_user_agent: input.userAgent,
    fbp: input.fbp,
    fbc: input.fbc,
    external_id: hashed(input.visitorId),
    em: hashed(input.email),
    ph: hashed(input.phone, "phone"),
    fn: hashed(firstName),
    ln: hashed(lastName),
  });

  const customData = compact({
    currency: input.currency,
    value: input.value,
    content_ids: input.contentId ? [input.contentId] : undefined,
    content_name: input.contentName,
    content_type: input.contentType || (input.contentId ? "product" : undefined),
    order_id: input.orderId,
  });

  const body = compact({
    data: [{
      event_name: input.eventName,
      event_time: input.eventTime || Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: "website",
      event_source_url: input.eventSourceUrl,
      user_data: userData,
      custom_data: Object.keys(customData).length ? customData : undefined,
    }],
    test_event_code: process.env.META_CAPI_TEST_EVENT_CODE?.trim() || undefined,
  });

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      },
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("[meta capi]", response.status, result);
      return { sent: false, reason: "api_error" as const };
    }
    return { sent: true, result };
  } catch (error) {
    console.error("[meta capi] request failed", error);
    return { sent: false, reason: "request_failed" as const };
  }
}
