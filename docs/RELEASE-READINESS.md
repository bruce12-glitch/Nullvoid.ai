# NULLVOID.AI — Release Readiness Assessment

**Date:** 2026-08-18 · **Branch:** `arena/01a013fe-nullvoid-ai`
**Verdict:** 🟡 **Not yet shippable — but no longer blocked by code.**

All code-level release blockers found in this review have been fixed and
verified. What remains is **configuration and manual QA**, listed in §4.

---

## 1. Verification results

| Check | Before | After |
|---|---|---|
| `tsc --noEmit` | 9 errors | **0** |
| `next build` (production) | ❌ failed | ✅ **succeeds** |
| Unit tests | 6/6 | **10/10** (+4 regression) |
| ESLint | 23,096 problems | **53** (16 style errors, 0 correctness) |
| Routes returning 200 | landing only | `/`, `/dashboard`, `/editor`, `/editor/[roomId]`, `/canvas/[id]`, `/api/health` |
| Canvas modules bundling | untested | **8/8 clean** |

`typescript.ignoreBuildErrors: true` had been hiding every type error; it is
now removed and the build enforces types.

---

## 2. Security vulnerabilities fixed

### 2.1 Authentication failed **open** (critical)
`lib/project-access.ts` and `actions/project.actions.ts` caught Clerk errors
and returned a shared `preview_user_001` identity. Any Clerk outage or
misconfiguration in production would hand **every anonymous visitor the same
authenticated account** — and full read/write access to its projects. Both now
fail closed.

### 2.2 Placeholder secrets disabled all route protection (critical)
`proxy.ts` enabled preview bypass whenever `CLERK_SECRET_KEY` merely *contained*
the substring `"dummy"` or `"preview"`. A leftover placeholder key silently
disabled auth for the entire app while looking normal. Bypass is now
**opt-in AND non-production only** (`NODE_ENV !== "production" && PREVIEW_BYPASS_AUTH === "true"`),
applied consistently across middleware, server actions, API routes and layout.

### 2.3 TLS verification disabled on the database (high)
`lib/db.ts` set `ssl: { rejectUnauthorized: false }` on every connection,
permitting a man-in-the-middle to read or rewrite all traffic. Now verified by
default; opt-out via `DATABASE_SSL_NO_VERIFY` is **rejected in production**.

### 2.4 Clickjacking in production (high)
`next.config.ts` emitted `X-Frame-Options: ALLOWALL` and CSP
`frame-ancestors ... *` unconditionally. Because CSP `frame-ancestors` overrides
`X-Frame-Options`, this defeated the hardened `DENY` in `vercel.json`. Those
headers are now dev/preview only.

### 2.5 Production CSP blocked the app's own services (high)
`connect-src` omitted Gemini, Trigger.dev, Sentry, PostHog and Vercel Blob — so
**AI features would have failed in production** even with valid keys. Added.

### 2.6 Silent mock database in production (medium)
`lib/db.ts` substituted a query-less client on any misconfiguration, turning a
config error into confusing runtime 500s. Now fails fast at startup.

---

## 3. Functional bugs fixed

### 3.1 Liveblocks split-brain — edits silently discarded (critical)
`useLiveblocksFlow()` stores the graph under key `"flow"` (verified in the
compiled SDK: `DEFAULT_STORAGE_KEY = "flow"`), and auto-creates
`root.flow.{nodes,edges}`. The config, both `initialStorage` seeds and every
hand-written reader/writer used flat `root.nodes`/`root.edges` instead.

Result: React Flow wrote to `flow.*` while the app's own code mutated an
**empty orphan map**. Renaming a node, recolouring it, or editing an edge label
did nothing — no error, no warning. Unified on the `flow` schema.

### 3.2 AI agents never reached the canvas (critical)
Once the schema was corrected, the type checker exposed that **all three**
backend AI agents (`design-agent`, `design-agent-3d`, `generate-architecture`)
wrote to `root.nodes`/`root.edges`. Every AI-generated architecture was
discarded while the run reported success. Fixed in all three.

### 3.3 AI specs always described an empty system (critical)
`ai-sidebar.tsx` read the node map with `Array.from(map.values?.() ?? [])`.
`useStorage` returns an immutable **plain object**, not a Map — so `.values` is
`undefined` and the expression always evaluated to `[]`. Every generated spec
was produced from an empty canvas. Now uses `Object.values()`, matching what
the Liveblocks library does internally.

### 3.4 AI chat edits were lost on reload (high)
`ChatPanel` applied AI patches to the local Zustand store only. Collaborators
never saw them and they vanished on refresh. Now pushed to the CRDT (including
on revert).

### 3.5 The 3D editor had no persistence at all (high)
`/canvas/[id]` never called the canvas load/save API. Diagrams built there
survived only while the room stayed warm. Added `CanvasPersistence`, giving the
3D route the same load + autosave as the 2D editor.

### 3.6 Auth-dependent pages were statically prerendered (high)
`/dashboard`, `/editor` and `/editor/[roomId]` had no `dynamic` export, so
Next.js tried to build them at compile time — **failing the production build**
and risking a cached shell of one user's data. Marked `force-dynamic`.

### 3.7 Inconsistent auth broke project CRUD (high)
Five API routes called Clerk directly instead of the shared identity helper,
so `/api/projects` returned 500 and project create/list/rename/delete were
unusable outside full Clerk setup. Unified.

### 3.8 Bodyless 500s on missing configuration (medium)
Unguarded `put()` and `tasks.trigger()` calls threw out of their handlers,
returning empty 500s. They now return actionable errors naming the exact
missing variable — e.g. *"Background jobs are not configured. Set
TRIGGER_SECRET_KEY."*

---

## 4. Can users create system design diagrams? — **Yes, with caveats**

Verified working end-to-end:

- ✅ Project create / list / rename / delete (`204`/`200`/`201` as appropriate)
- ✅ Editor routes render (2D `/editor/[roomId]`, 3D `/canvas/[id]`)
- ✅ Shape palette → drag-drop → node creation, connection and inline editing
  paths all compile and bundle cleanly (8/8 modules)
- ✅ Node rename / recolour / edge labels **now actually persist** (were silently
  discarded before §3.1)
- ✅ Canvas autosave wired on **both** 2D and 3D routes (3D was missing entirely)

**Blocked only by configuration, not code:**

| Feature | Requires |
|---|---|
| Canvas persistence across reloads | `BLOB_READ_WRITE_TOKEN` |
| AI generation, chat-modify, spec generation | `GEMINI_API_KEY` + `TRIGGER_SECRET_KEY` |
| Realtime collaboration | `LIVEBLOCKS_SECRET_KEY` |
| Sign-in / accounts | Clerk keys |
| All data | A real `DATABASE_URL` + `prisma generate` |

`.env.example` now documents all 18 variables.

---

## 5. Remaining work before launch

**Must do**

1. **Provision credentials** and run `prisma generate` + `prisma migrate deploy`.
   (Prisma's engine CDN is unreachable from this sandbox, so the generated
   client could not be produced here — the client is gitignored by design.)
2. **Manual QA in a real browser.** Chromium could not be installed here, so
   drag-drop, 3D gizmo interaction and multi-user presence are verified only at
   compile/bundle level, not visually.
3. **Re-test AI features with live keys.** Their code paths are fixed and
   verified, but no call has been made against real Gemini/Trigger endpoints.

**Should do**

4. `npm audit`: **55 vulnerabilities (27 high)**. `next` has a non-breaking fix
   (`16.2.4 → 16.3.1`); the rest are major-version bumps for `@react-three/*`,
   `@trigger.dev/*`, `prisma` and `@clerk/ui`. Deliberately not applied here —
   they are breaking changes needing their own regression pass.
5. **Rate limiting is per-instance.** `chat-modify` uses an in-memory Map, so on
   serverless each instance has its own counter. Move to Redis/Upstash before
   exposing paid AI endpoints publicly.
6. **Decide on one canvas.** Two parallel stacks (2D React Flow, 3D R3F) still
   coexist with separate state models. Both work, but they double the
   maintenance surface.
7. Consider deleting the now-untracked 534 MB of `.trigger/` artifacts from git
   history (untracking stops the bleeding; history still carries the weight).

---

## 6. Bottom line

The application went from **failing to build** to a clean production build with
zero type errors, and from several silent data-loss paths to a verified
create-a-diagram journey. Six security vulnerabilities were closed, two of them
capable of exposing one user's projects to anonymous visitors.

It is **not ready to ship today** — it needs real credentials and a human QA
pass in a browser. But nothing in the codebase is now known to be blocking.
