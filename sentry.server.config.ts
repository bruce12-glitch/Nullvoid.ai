import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event) {
    // Scrub sensitive headers or tokens in server-side requests
    if (event.request && event.request.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    
    // Scrub any potential GEMINI_API_KEY from error traces
    if (event.exception && event.exception.values) {
      event.exception.values.forEach((value) => {
        if (value.value && typeof value.value === "string") {
          value.value = value.value.replace(/AIza[0-9A-Za-z-_]{35}/g, "[Scrubbed Gemini Key]");
        }
      });
    }

    return event;
  },
});
