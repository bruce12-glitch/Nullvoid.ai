# Feature Unit 30: Telemetry, Observability & Error Tracking

Execute the following operational monitoring and telemetry setup:

1. ERROR TRACKING & EXCEPTION LOGGING (sentry.server.config.ts, sentry.client.config.ts & sentry.edge.config.ts):
   - Install `@sentry/nextjs` (`npx @sentry/wizard@latest -i nextjs`).
   - Configure Sentry error capturing for serverless route handlers, server actions, and client-side React boundaries.
   - Suppress non-critical WebGL context warnings while capturing unhandled 3D render failures and WebGPU initialization errors.
   - Scrub sensitive auth tokens (`Clerk` JWTs, `GEMINI_API_KEY`) from automated error breadcrumbs.

2. PRODUCT ANALYTICS & EVENT TRACKING (src/lib/telemetry/posthog.ts):
   - Install `posthog-js` if missing (`npm install posthog-js`).
   - Configure PostHog provider component (`src/components/providers/PostHogProvider.tsx`) initialized with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.
   - Instrument key user action events:
     - `project_created` (template type, project ID)
     - `ai_generation_triggered` (prompt length, token output count)
     - `canvas_exported` (format: PNG | JSON | Markdown)
     - `collaboration_session_joined` (collaborator count)

3. WEB VITALS & 3D PERFORMANCE TELEMETRY (src/app/performance-reporter.ts):
   - Hook into Next.js `useReportWebVitals` to record Core Web Vitals (LCP, FID, CLS, INP, TTFB).
   - Capture custom R3F canvas metric events: Average Canvas FPS, WebGL Context Loss count, and GPU Memory Peak usage during complex system renders.

4. API HEALTHCHECK & TELEMETRY ROUTE (src/app/api/health/route.ts):
   - Build an unauthenticated health check endpoint returning JSON status:
     - Prisma Neon PostgreSQL connectivity check.
     - Liveblocks WebSocket service ping.
     - Trigger.dev background worker status.
   - Return `200 OK` (`{ status: "healthy", timestamp: ISOString }`) or `503 Service Unavailable` if core storage layer pings fail.

5. VERIFICATION & PROGRESS UPDATE:
   - Run TypeScript verification (`npx tsc --noEmit`).
   - Confirm `/api/health` returns `200 OK` locally.
   - Update context/progress-tracker.md to mark "Feature 30: Telemetry, Observability & Error Tracking" as COMPLETED and confirm full operational coverage across all 30 feature specifications.
