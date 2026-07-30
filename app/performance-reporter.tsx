"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Reports Core Web Vitals (LCP, FID, CLS, INP, TTFB) to PostHog.
 * Uses the web-vitals library directly for maximum compatibility.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    import("web-vitals").then(({ onCLS, onLCP, onINP, onTTFB }) => {
      const reportMetric = (metric: { name: string; value: number; id: string }) => {
        posthog.capture(`web_vital_${metric.name.toLowerCase()}`, {
          value: metric.value,
          id: metric.id,
        });
      };

      onCLS(reportMetric);
      onLCP(reportMetric);
      onINP(reportMetric);
      onTTFB(reportMetric);
    }).catch(() => {
      // web-vitals may not be available — silently skip
    });
  }, []);

  return null;
}
