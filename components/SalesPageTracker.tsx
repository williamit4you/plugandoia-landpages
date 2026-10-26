"use client";

import { useEffect } from "react";
import { pageView, viewContent } from "@/lib/metaPixel";
import { createSalesEventId, hasOptionalAnalyticsConsent, SALES_PAGE_EVENT_TYPES, trackSalesEvent } from "@/lib/salesAnalytics";

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

  useEffect(() => {
    // Optional quality telemetry is aggregate-first and carries neither typed input nor PII.
    if (!hasOptionalAnalyticsConsent()) return;
    const quality = (eventType: "WEB_VITAL" | "PAGE_QUALITY", metadata: Record<string, unknown>) => trackSalesEvent({
      pageKey, pagePath, pageTitle, eventType, metadata,
    });
    let maxDepth = 0;
    const onScroll = () => {
      const available = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const depth = Math.min(100, Math.round(window.scrollY / available * 100));
      if (depth >= maxDepth + 25 || (depth === 100 && maxDepth !== 100)) { maxDepth = depth; quality("PAGE_QUALITY", { metric: "scroll_depth", value: depth }); }
    };
    const onError = () => quality("PAGE_QUALITY", { metric: "javascript_error" });
    const observer = typeof PerformanceObserver === "undefined" ? null : new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        const anyEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (entry.entryType === "largest-contentful-paint") quality("WEB_VITAL", { metric: "lcp_ms", value: Math.round(entry.startTime) });
        if (entry.entryType === "layout-shift" && !anyEntry.hadRecentInput) quality("WEB_VITAL", { metric: "cls", value: anyEntry.value || 0 });
      }
    });
    try { observer?.observe({ type: "largest-contentful-paint", buffered: true } as PerformanceObserverInit); observer?.observe({ type: "layout-shift", buffered: true } as PerformanceObserverInit); } catch { /* unsupported browser */ }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("error", onError);
    const timer = window.setTimeout(() => quality("PAGE_QUALITY", { metric: "load_ms", value: Math.round(performance.now()) }), 0);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("error", onError); window.clearTimeout(timer); observer?.disconnect(); };
  }, [pageKey, pagePath, pageTitle]);

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
