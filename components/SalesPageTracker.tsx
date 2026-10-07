"use client";

import { useEffect } from "react";
import { pageView, viewContent } from "@/lib/metaPixel";
import { createSalesEventId, SALES_PAGE_EVENT_TYPES, SalesPageTrackPayload, trackSalesEvent } from "@/lib/salesAnalytics";

type SalesPageTrackerProps = {
  pageKey: string;
  pagePath: string;
  pageTitle?: string;
  metadata?: Record<string, unknown>;
};

export function SalesPageTracker({ pageKey, pagePath, pageTitle, metadata }: SalesPageTrackerProps) {
  useEffect(() => {
    const eventId = createSalesEventId("pageview");
    pageView(eventId);
    trackSalesEvent({
      pageKey,
      pagePath,
      pageTitle,
      eventType: SALES_PAGE_EVENT_TYPES.PAGE_VIEW,
      eventId,
      metadata,
    });
  }, [metadata, pageKey, pagePath, pageTitle]);

  return null;
}

type SalesViewContentTrackerProps = {
  pageKey: string;
  pagePath: string;
  pageTitle?: string;
  currency?: string;
  value?: number;
  metadata?: Record<string, unknown>;
};

export function SalesViewContentTracker({
  pageKey,
  pagePath,
  pageTitle,
  currency,
  value,
  metadata,
}: SalesViewContentTrackerProps) {
  useEffect(() => {
    const eventId = createSalesEventId("viewcontent");
    viewContent({
      content_name: metadata?.contentName || pageTitle,
      content_type: metadata?.contentType || "product",
      currency,
      value,
    }, eventId);
    trackSalesEvent({
      pageKey,
      pagePath,
      pageTitle,
      eventType: SALES_PAGE_EVENT_TYPES.VIEW_CONTENT,
      eventId,
      currency,
      value,
      metadata,
    });
  }, [currency, metadata, pageKey, pagePath, pageTitle, value]);

  return null;
}
