import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  tracesSampleRate: 1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  ignoreErrors: [
    "WebGL context was lost",
    "WebGL: CONTEXT_LOST_WEBGL",
    "Missing robot_playground.glb",
    "ResizeObserver loop completed with undelivered notifications",
    "ResizeObserver loop limit exceeded"
  ],
  beforeSend(event) {
    // Scrub sensitive headers or tokens if any slip into client errors
    if (event.request && event.request.headers) {
      delete event.request.headers["Authorization"];
    }
    return event;
  },
});
