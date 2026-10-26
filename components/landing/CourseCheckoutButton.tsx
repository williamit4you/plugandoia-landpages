"use client";

import { MouseEvent } from "react";
import { CTAButton } from "@/components/landing/cta-button";
import { MetaPixelEventData, initiateCheckout } from "@/lib/metaPixel";
import { createSalesEventId, SALES_PAGE_EVENT_TYPES, getJourneyId, getSalesSessionId, getSalesVisitorId, trackSalesEvent } from "@/lib/salesAnalytics";

type CourseCheckoutButtonProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  eventData?: MetaPixelEventData;
  pageKey?: string;
  pagePath?: string;
  className?: string;
  hideGlow?: boolean;
};

export function CourseCheckoutButton({
  href,
  label,
  variant = "primary",
  eventData,
  pageKey = "curso-fundamentos-ia",
  pagePath = "/curso-fundamentos-ia",
  className,
  hideGlow = false,
}: CourseCheckoutButtonProps) {
  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    let trackedHref = href;
    try {
      const destination = new URL(href);
      const current = new URL(window.location.href);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "campaign_id", "adset_id", "ad_id"].forEach((key) => {
        const value = current.searchParams.get(key);
        if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
      });
      const sessionId = getSalesSessionId(), visitorId = getSalesVisitorId(), journeyId = getJourneyId();
      if (sessionId) destination.searchParams.set("src", `lp_${sessionId}`);
      if (visitorId) destination.searchParams.set("visitor_id", visitorId);
      if (journeyId) destination.searchParams.set("journey_id", journeyId);
      destination.searchParams.set("sck", pageKey);
      trackedHref = destination.toString();
    } catch { /* preserve original checkout address */ }
    // Checkout buttons send InitiateCheckout before leaving the site for Hotmart.
    const eventId = createSalesEventId("checkout");
    initiateCheckout(eventData, eventId);
    await trackSalesEvent({
      pageKey,
      pagePath,
      eventType: SALES_PAGE_EVENT_TYPES.INITIATE_CHECKOUT,
      eventId,
      checkoutUrl: trackedHref,
      currency: typeof eventData?.currency === "string" ? eventData.currency : undefined,
      value: typeof eventData?.value === "number" ? eventData.value : undefined,
      metadata: {
        buttonLabel: label,
      },
    });

    window.setTimeout(() => {
      window.location.assign(trackedHref);
    }, 150);
  }

  return <CTAButton href={href} label={label} onClick={handleClick} variant={variant} className={className} hideGlow={hideGlow} />;
}
