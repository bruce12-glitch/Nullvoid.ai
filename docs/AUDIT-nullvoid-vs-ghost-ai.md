# NULLVOID.AI — Repository Audit vs `adrianhajdin/ghost-ai`

Date: 2026-08-18 · Branch: `arena/01a013fe-nullvoid-ai`
Baseline: `adrianhajdin/ghost-ai` @ `ad365e1` · This repo: @ `fee1504`

---

## 1. Relationship between the two repos

NULLVOID.AI is a **fork-and-extend** of ghost-ai, not a partial copy.

| | ghost-ai | nullvoid.AI |
|---|---|---|
| Source files (ts/tsx/prisma/css/json) | 72 | **203** |
| Files present in ghost but not here | — | **1** (`prisma/models/project.prisma`, merged into `schema.prisma`) |
| Files here but not in ghost | — | **129** |

**Conclusion: essentially no ghost-ai code is missing.** The single absent file
was folded into `prisma/schema.prisma`. Everything ghost-ai has, this repo has.

What NULLVOID adds on top: a Three.js/R3F 3D canvas, Zustand + XState state
layer, an AI pipeline (`lib/ai/*` — layout engine, edge router, collision
avoidance, patch applier), analytics (cost engine, throughput simulator),
Sentry + PostHog telemetry, a dashboard, Clerk webhooks, and Vitest/Playwright
test scaffolding.

So "the missing codes" are **not** missing ghost-ai files. They are
**integration gaps inside NULLVOID's own additions** — documented below.

---

## 2. Verification performed

- `npx tsc --noEmit` → **9 errors** (all one root cause, §3.1)
- `npx vitest run` → **6/6 tests pass**
- `npx next build` → all modules compile; only fails fetching Google Fonts
  (sandbox network restriction, **not** a code defect)
- Broken-import scan across 203 files → 1 unresolved specifier (§3.1)
- Runtime proof of the Liveblocks bugs via Node against the real SDK, plus
  inspection of the **compiled** `@liveblocks/react-flow@3.23.0` implementation
  (`dist/lib/flow.js`, `dist/lib/shared.js`) — not merely its `.d.ts` docs

All findings were re-verified in a second pass. That pass **overturned one
claim** about `useLiveblocksCanvasSync.ts` throwing at runtime; the correction
is recorded inline in §3.2. Every other finding reproduced unchanged.

---

## 3. Findings

### 3.1 — BLOCKER: Prisma client is never generated

`npm install` runs `postinstall: prisma generate`, which **fails** (blocked
download of `binaries.prisma.sh`). `lib/generated/prisma/` therefore never
exists, and `lib/db.ts` imports it. This single failure produces **all 9**
TypeScript errors:

```
lib/db.ts(1,30):                  TS2307  Cannot find module './generated/prisma/client'
actions/project.actions.ts(5,36): TS2307  Cannot find module '@/lib/generated/prisma/client'
+ 7 × TS7006 implicit-any (p, c, row, item) — cascade: Prisma row types
      degrade to `any`, so every .map()/.filter() callback loses its type
```

Proof: stubbing the generated client dropped errors 9 → 7, and the remaining 7
are purely the implicit-any cascade. **No hand-written source file is broken.**

Fix: `npx prisma generate` on a machine with network access. Note
`next.config.ts` sets `typescript.ignoreBuildErrors: true`, which is why this
has stayed hidden — it masks all 9 errors at build time.

### 3.2 — CRITICAL: Liveblocks storage-key mismatch (silent data loss)

Two incompatible storage schemas coexist in the **same room**. This is the most
important defect in the repo and is invisible at compile time.

Verified against the installed runtime (`@liveblocks/react-flow@3.23.0`), not
just the typings — `dist/lib/shared.js:3`:

```js
const DEFAULT_STORAGE_KEY = "flow";
```

and `dist/lib/flow.js:137`: `storageKey: options.storageKey ?? DEFAULT_STORAGE_KEY`.

`canvas-editor.tsx:62` calls `useLiveblocksFlow({ suspense: true })` and
**never passes `storageKey`** (grep confirms the option appears nowhere in the
repo). So React Flow reads and writes `root.flow.nodes` / `root.flow.edges`.

Crucially, the hook **auto-creates** that subtree — `flow.js:228` runs
`setInitialStorage()` on mount, which does
`storage.set("flow", new LiveObject({ nodes, edges }))` when `root.flow` is
absent. Meanwhile `editor-workspace-client.tsx:52` seeds `initialStorage` with
flat `{ nodes, edges, systemMetadata }`.

**Net result: the 2D room ends up with BOTH.** `root.flow.*` holds the live
diagram; `root.nodes` / `root.edges` remain permanently empty orphans. The
mismatch is therefore not a crash — it is a silent split-brain:

| Site | Code | Effect |
|---|---|---|
| `canvas-node.tsx:122,128` | `storage.get("nodes")?.get(id)` | hits the **empty orphan** map → `get(id)` returns `undefined` → `?.`/guard swallows it → **renaming / recoloring a node silently does nothing** |
| `canvas-edge.tsx:31` | `storage.get("edges")?.get(id)` | same → **edge label edits silently dropped** |

ghost-ai avoids this on both sides: it seeds
`initialStorage={new LiveObject({ flow: new LiveObject({ nodes, edges }) })}`
and its writers use `storage.get("flow").get("nodes").get(id)`. The fork
flattened the schema but never updated the writers.

**Correction to an earlier draft of this audit:** the writers in
`hooks/useLiveblocksCanvasSync.ts` (lines 46/52/62/119) use unguarded
`storage.get("nodes").set(...)`, which I initially reported as throwing at
runtime. That is **wrong**. Those hooks are used only by the 3D canvas
(`/canvas/[id]`), which never calls `useLiveblocksFlow`; its `initialStorage`
does define flat `nodes`/`edges`, so `storage.get("nodes")` resolves to a real
LiveMap and does not throw. The 3D path is self-consistent. The defect is
confined to the 2D path — which is the more damaging outcome, since a crash
would at least be visible.

### 3.3 — CRITICAL: `useStorage` LiveMap read returns `[]` always

`components/editor/ai-sidebar.tsx:131,133`:

```ts
const nodesArray = nodesLiveMap ? Array.from((nodesLiveMap as any).values?.() ?? []) : []
```

`useStorage` hands back an **immutable plain object**, not a `Map` — so
`.values` is `undefined`, `?.()` yields `undefined`, `?? []` returns `[]`.

Verified against the real SDK:

```
nullvoid  Array.from(x.values?.() ?? [])  =>  []            ← always empty
ghost     Object.values(x)                =>  [{"id":"a"}]  ← correct
```

Independent corroboration: the Liveblocks library itself uses exactly the
`Object.values(...)` form internally for this data
(`@liveblocks/react-flow/dist/lib/flow.js:110-117`, `nodeMapToList`).

Note this bug is **compounded by §3.2** — `ai-sidebar.tsx` reads `root.nodes`,
which in a 2D room is the empty orphan map anyway. Both bugs must be fixed for
spec generation to see real data.

The `as any` cast is what suppresses the type error. Net effect: **AI spec
generation always posts an empty canvas** (`nodes: []`, `edges: []`) to
`/api/ai/spec`, so generated specs never reflect the user's actual diagram.

ghost-ai gets this right and even documents it in a comment. Note
`hooks/useLiveblocksCanvasSync.ts:24,32` already uses the correct
`Object.values(...)` — the codebase contradicts itself.

### 3.4 — HIGH: Authentication is entirely disabled

`app/layout.tsx` **never mounts `ClerkProvider`** — the prod branch contains
only a comment: *"you would wrap with ClerkProvider etc. — kept minimal for now
to avoid bailout"*. Meanwhile 12 files call Clerk APIs, including
`components/auth/user-button-wrapper.tsx` and `editor-navbar.tsx`, which use
client hooks that **require** the provider.

`proxy.ts` compounds it: `isPreviewBypass()` returns true whenever
`PREVIEW_BYPASS_AUTH=true` *or* the Clerk keys merely contain the substring
`"dummy"`/`"preview"`, and then returns `NextResponse.next()` for **every
route** — no `auth.protect()`. A stray env value silently disables all route
protection in production. ghost-ai's `proxy.ts` always protects non-public routes.

Related: `lib/db.ts` silently falls back to a **mock PrismaClient** when
`DATABASE_URL` contains `"dummy"`/`"mock"` — failing open rather than loudly.

### 3.5 — MEDIUM: Two parallel, non-interoperating canvas stacks

| | 2D stack | 3D stack |
|---|---|---|
| Route | `/editor/[roomId]` | `/canvas/[id]` |
| Shell | `editor-workspace-client.tsx` | `EditorLayout` + `Scene` |
| Engine | `@xyflow/react` + `useLiveblocksFlow` | `@react-three/fiber` |
| State | Liveblocks `root.flow` | Zustand + `root.nodes` |

Both mount `RoomProvider` with **conflicting `initialStorage`** against the same
room-id space. A room created by one is unreadable by the other. `types/canvas.ts`
papers over this with compatibility unions (`"canvasNode"` alongside `SERVICE`,
`DATABASE`, …) rather than a single model. Pick one persistence shape.

Both routes also declare the *same* flat `initialStorage`, so the two stacks
additionally disagree with the `root.flow` layout that §3.2 shows React Flow
actually creates. Resolving §3.2 and §3.5 together is advisable — a single
storage schema fixes both.

### 3.6 — LOW: dead code, hygiene, env drift

- **9 orphaned modules** never imported: `ClientProviders.tsx` (which wires
  PostHog + Tooltip + Settings + WebVitals — likely *should* be in `layout.tsx`,
  explaining why telemetry appears configured but inert), `LenisProvider`,
  `CanvasLoader`, `LODNode`, `NodeCostBadge`, `prompt-bar`, `ui/card`,
  `ui/skeleton`, `use-project-dialogs`.
- **720 build artifacts committed** under `.trigger/` (**534 MB**) — including
  Windows paths (`AppData/…`, `OneDrive/Desktop/…`). `.gitignore` lists
  `/.trigger/` but they were committed before the rule; ignore rules don't
  apply retroactively. Also tracked: `%TEMP%nv_check.html`, `kill_node.ps1`,
  `test-db-final.ts`, `test_website.ps1`. Purge with `git rm -r --cached`.
- **No `.env.example`** despite **18** required env vars: `DATABASE_URL`,
  `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `LIVEBLOCKS_SECRET_KEY`,
  `GEMINI_API_KEY`, `GOOGLE_AI_API_KEY`, `TRIGGER_SECRET_KEY`,
  `NEXT_PUBLIC_TRIGGER_PUBLIC_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`,
  `SENTRY_PROJECT`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`,
  `PREVIEW_BYPASS_AUTH`, `ANALYZE`, `NODE_ENV`, `CI`.
- **Gemini key drift**: `gemini-client.ts` and `design-agent.ts` prefer
  `GEMINI_API_KEY`; `generate-spec.ts:101` prefers `GOOGLE_AI_API_KEY`.
  Setting only one makes some paths work and others fail.
- `typescript.ignoreBuildErrors: true` in `next.config.ts` hides §3.1 — remove
  once the Prisma client generates.

---

## 4. Priority

1. **§3.1** `prisma generate` (unblocks typecheck) + drop `ignoreBuildErrors`
2. **§3.2** unify on the `"flow"` schema — update `liveblocks.config.ts`,
   the two `initialStorage` seeds, and the `canvas-node`/`canvas-edge` writers
   (or pass an explicit `storageKey`) — restores node/edge editing
3. **§3.3** `Object.values(...)` in `ai-sidebar.tsx` — restores AI spec accuracy
4. **§3.4** mount `ClerkProvider`; make bypass opt-in and dev-only
5. **§3.5** choose one canvas persistence model
6. **§3.6** purge `.trigger/`, add `.env.example`, unify the Gemini key

§3.2 and §3.3 are the highest-value fixes: both are **silent**, both survive
typecheck, and together they mean edits vanish and the AI never sees the canvas.
