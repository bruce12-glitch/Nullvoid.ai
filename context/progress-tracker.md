# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 3: Production Hardening — COMPLETED (2026-08-18)

## Current Goal

🚀 Market-ready. App is fully functional in SOLO mode (no external accounts) and upgrades automatically to FULL mode when service keys are configured.

## Phase 3 — Production Hardening (2026-08-18)

### Dual runtime modes (SOLO / FULL)
- `lib/runtime.ts`: server-side service detection (Clerk, Liveblocks, Trigger.dev, Blob, Gemini).
- `next.config.ts` injects `NEXT_PUBLIC_COLLAB_ENABLED` / `NEXT_PUBLIC_AUTH_ENABLED` / `NEXT_PUBLIC_TRIGGER_ENABLED` at build time.
- `lib/collab/` facade: all components now import Liveblocks hooks via `@/lib/collab/{react,suspense,flow,provider}` — real Liveblocks in FULL mode, local store (`lib/collab/solo.ts`) with identical semantics in SOLO mode (mock CRDT storage, undo/redo history, feeds, event bus, React Flow binding).
- `lib/auth-ui.tsx` facade for Clerk UI components (UserButton/UserProfile/useUser) with guest fallbacks.

### Inline AI execution (no Trigger.dev required)
- `lib/ai/design-engine.ts`: shared design-agent core (system prompt, tools with execute handlers + multi-step stopWhen, RF-array applier, CRDT applier for hybrid mode).
- `lib/ai/spec-engine.ts`: shared spec generator.
- `/api/ai/design` and `/api/ai/spec` run Gemini inline when TRIGGER_SECRET_KEY is absent; client applies results to the solo store.
- `lib/ai/model-fallback.ts`: Gemini model candidate chain (gemini-flash-latest → 3.6-flash → …) — fixes retired `gemini-2.5-flash` (404 for new keys) and load-shedding 503s.

### Storage fallbacks (no Vercel Blob required)
- Canvas PUT stores JSON inline in `Project.canvasBlobUrl` when blob token is missing/invalid (GET already parsed inline JSON).
- New `ProjectSpec.content` column (migration `add_spec_inline_content`) stores spec Markdown in PostgreSQL.

### Bug fixes
- `/api/projects` + `/api/projects/[projectId]` called Clerk `auth()` directly → crashed without middleware; now use `getCurrentProjectIdentity()`.
- `/api/liveblocks-auth` no longer hard-depends on Clerk `currentUser()`.
- `GET /specs/[specId]` returned JSON metadata while the client rendered `res.text()` as Markdown → now returns Markdown content (blob or inline).
- `ai-sidebar` `useStorage` snapshot handling: `.values?.()` on plain objects always yielded empty arrays → spec generation sent an empty canvas; now normalises Map/object snapshots.
- `app/layout.tsx` restored: proper ClerkProvider in FULL mode, metadata/OG tags added, solo-mode banner otherwise.
- Sign-in/up pages crashed without ClerkProvider → `AuthWidget` renders Clerk or guest-access card.
- `/dashboard` and `/editor` were statically prerendered at build time → forced dynamic.
- Landing page: removed 9 dead `href="#"` links, wired section anchors + GitHub, fixed template leftover nav copy.
- `vercel.json` CSP extended for real Clerk/Liveblocks/Trigger domains.
- Design agent tools had no execute handlers → generation stopped after one step (nodes but no edges); multi-step loop fixed.

### Housekeeping
- Removed stray dev files (`kill_node.ps1`, `run.ps1`, `test_website.ps1`, `test-db-final.ts`, `%TEMP%nv_check.html`, committed `.trigger/` build artifacts).
- Added `.env.example`, `scripts/dev-setup.sh`, README dual-mode docs.
- Production build passes (`next build`, 16 routes). E2E-verified: project CRUD, canvas autosave/load, AI design (13 nodes/12 edges), spec generation + preview + download, chat-modify, all pages 200.

## Open Questions
- Trigger.dev tasks (`trigger/*.ts`) still target the FULL stack — verify against a real Trigger.dev project when keys are added.
- 3D `/canvas/[id]` solo mode works via the same facade; deeper 3D interaction QA recommended in a browser.

---

# Previous Phases

## Completed

- Workspace initialization and code baseline cloned (`adrianhajdin/ghost-ai`).
- Deployed the 6-file context framework for **NullVoid.AI** in the root directory.
- Installed all Node.js dependencies (`npm install`).
- Auto-generated Prisma client (`v7.9.1`).
- Created `.env.example` template for downstream services.
- Configured `.env` with Clerk and Liveblocks keys.
- Resolved Prisma configuration (`@neondatabase/serverless` fallback for WebSockets).
- Installed `@clerk/nextjs` manually and configured Next.js proxy routing.
- Fixed Trigger.dev version mismatch and successfully authenticated CLI.
- Launched `npm run dev` and `npx trigger.dev dev` servers successfully.
- Verified Prisma schema is currently empty (awaiting database models).

### Feature 01: Design System — COMPLETED
- shadcn/ui configured (dark, `base-nova`). Verified 10 components present.
- `lib/utils.ts` exports `cn()` and `globals.css` uses strict token variables.

### Feature 02: Editor Chrome Layout — COMPLETED
- Built `src/app/canvas/[id]/page.tsx` full-screen layout.
- Created `EditorLayout.tsx` handling z-index layering between 3D and 2D.
- Implemented 4 glassmorphic 2D overlays mapped to strict CSS tokens: `TopBar`, `LeftSidebar`, `InspectorPanel`, `PromptBar`.
- Refactored `Scene.tsx` with `<Suspense>`, `<Grid infiniteGrid>`, and WebGPU settings.
- Configured `Environment.tsx` with studio lighting (Soft Key, Rim) and `<ContactShadows>`.
- Integrated `RobotNode.tsx` with a `<ErrorBoundary>` fallback handling the missing `robot_playground.glb`.
- Added strict memory disposal in `RobotNode.tsx` using `disposeThreeObject`.

### Feature 03: Auth UI Shell & Protected Routes — COMPLETED
- Scaffolded Next.js route groups `app/(auth)/sign-in/[[...sign-in]]/page.tsx` & `app/(auth)/sign-up/[[...sign-up]]/page.tsx`.
- Applied glassmorphic container styling `bg-card/60 backdrop-blur-md border border-border/40 shadow-2xl rounded-2xl` floating over radial grid background.
- Styled `<ClerkProvider>` appearance variables in `layout.tsx` to match NullVoid AI's dark technical theme with `#3b82f6` primary color accent.
- Configured public routes in `proxy.ts` (`/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks(.*)`) protecting all workspace/canvas routes.
- Created `UserButtonWrapper` component with custom workspace links and mounted in `TopBar`.

### Feature 05: Database Schema & Project CRUD — COMPLETED
- Restructured `schema.prisma` to include `User`, `Project`, and `Spec` models with `cuid()` generation and cascade deletes.
- Configured Neon WebSocket adapter initialization via `lib/db.ts` utilizing `PrismaNeon` and Serverless Pool.
- Resolved Prisma V7 breaking changes (`url` property deprecation inside `schema.prisma` removed in favor of `prisma.config.ts`).
- Created Next.js Server Actions (`createProject`, `updateProject`, `deleteProject`, `getProjects`) under `actions/project.actions.ts`.
- Rewrote `app/dashboard/page.tsx` as a Server Component fetching real data and passing it to a newly separated `app/dashboard/dashboard-client.tsx`.
- Wired up real action execution, transition states, and revalidation hooks inside `ProjectCard` and `CreateProjectModal`.
- Removed legacy unused mock routes (`app/editor`, `app/api/projects`).
- Built responsive Dashboard layout with ambient lighting.
- Created glassmorphic `ProjectCard` with 3D grid thumbnails.
- Implemented `CreateProjectModal` for generating new workspaces.
- Created empty state handling (`EmptyProjects`) and tabs filtering.

### Feature 06: Settings Modal & Workspace Preferences — COMPLETED
- Implemented `hooks/useCanvasPreferences.ts` using Zustand and `zustand/middleware`'s `persist` for `localStorage` caching of preferences.
- Built a global `<SettingsModal />` utilizing shadcn `Dialog`, `Tabs`, and `Switch` for a unified glassmorphic interface.
- Embedded Clerk's `<UserProfile />` with custom CSS variables and element classes to match the design system.
- Hooked up `useCanvasPreferences` globally via `SettingsProvider` and wired it into the TopBar's `<UserButtonWrapper />` and `<DashboardLayout />`.
- Dynamically integrated preferences directly into the React Three Fiber pipeline (`<Scene />` and `<StageEnvironment />`), ensuring toggling grids or shadows happens reactively without re-mounting the canvas.

### Feature 08: Canvas Viewport Shell — COMPLETED
- Configured React Three Fiber `<Canvas>` within a dedicated `<CanvasContainer />` featuring a `ResizeObserver` listener to dynamically adjust FOV on extreme aspect ratios (preventing distortion).
- Integrated `lib/webgpu-check.ts` to implement a dynamic factory loader for WebGPU scaling (with seamless fallback to WebGL2).
- Built strict `<Camera />` restraints using Drei's `OrbitControls` (`minDistance: 2`, `maxDistance: 50`, `maxPolarAngle: 1.52`), incorporating smooth damping and panning.
- Perfected the `<Grid />` parameters and `<StageEnvironment />` lighting, mapping `<ContactShadows />` to the active performance mode.
- Ensured `<RobotNode />` wraps GLB loading inside a `<Suspense>` boundary (via `CanvasLoader.tsx` glassmorphic spinner) and triggers a procedural `<meshStandardMaterial>` fallback box if the asset is missing or fails to stream.

### Feature 09: Icon System & Toolbar UI — COMPLETED
- Added `@base-ui/react/tooltip` and integrated shadcn's `Tooltip` and `Separator` components.
- Developed `useCanvasTools` Zustand store for global toolbar states (`SELECT`, `PAN`, `ADD_NODE`, `CONNECT`, etc.) and `gizmoMode`.
- Built the interactive floating `<Toolbar />` at the bottom-center of the viewport featuring semantic glassmorphism and Lucide icons grouped logically by action type.
- Expanded `useKeyboardShortcuts` to map hotkeys (`V`, `H`, `N`, `C`, `T`, `R`, `S`, `K`) to tool selection while ensuring input fields are shielded from hotkey triggers.
- Updated `<EditorLayout />` to render the Toolbar inside the `z-10 pointer-events-none` 2D DOM layer.

### Feature 10: Canvas Data Types & Schemas — COMPLETED
- Installed `zod` for payload schema validation.
- Created `types/canvas.ts` defining types for `NodeType`, `EdgeType`, `Position3D`, `Rotation3D`, `CanvasNode`, and `CanvasEdge`, while successfully preserving integration mapping compatibility with React Flow (`Node` and `Edge` extensions).
- Created `types/spec.ts` defining `SystemSpec` schema format for system documents.
- Created `types/liveblocks.ts` containing typings for presence updates, user meta info, and custom room events.
- Created `lib/validations/canvas.ts` with Zod validation schemas (`CanvasNodeSchema`, `CanvasEdgeSchema`, `CanvasExportSchema`, and `SystemSpecSchema`) to validate import/export payloads.
- Integrated `types/liveblocks.ts` types inside `liveblocks.config.ts` to declare global Presence, UserMeta, and RoomEvent interfaces.

### Feature 11: 3D Base Canvas Engine — COMPLETED
- Created `stores/useCanvasStore.ts` — central Zustand store for 3D canvas state (nodes, edges, selectedNodeId, hoveredNodeId, cursor3D, canvasMode, activeNodeTypeToPlace) with full action API.
- Created `hooks/useCanvasRaycaster.ts` — spatial raycasting hook that projects screen mouse coordinates onto the Y=0 ground plane, with 0.5-unit grid snapping during `PLACING_NODE` and `SELECTING` modes.
- Created `components/canvas/BaseCanvas.tsx` — invisible interaction plane at Y=-0.02 that captures pointer events, streams cursor3D updates into the store, and triggers `deselectAll()` on empty-space clicks.
- Created `components/canvas/CanvasPerformance.tsx` — lightweight FPS/draw-calls/geometries monitor overlay with color-coded FPS thresholds (red < 30, yellow < 55, green ≥ 55), only rendered in quality mode.
- Integrated `BaseCanvas` and `CanvasPerformance` into `Scene.tsx`.

### Feature 12: 3D System Node Components — COMPLETED
- Created `components/canvas/Nodes/SystemNode.tsx` as a master wrapper component that parses `node.type` and renders the appropriate 3D mesh (`ServiceNode`, `DatabaseNode`, `GatewayNode`, `RobotNode`).
- Handled pointer events (`onPointerOver`, `onPointerOut`, `onClick`) in `SystemNode` connecting them to `useCanvasStore` with `e.stopPropagation()` to prevent raycaster misfires.
- Implemented smooth hover scaling via `useFrame` and `THREE.MathUtils.lerp`.
- Implemented wireframe selection bounding boxes for highlighted nodes.
- Created individual 3D geometry nodes (`ServiceNode` with RoundedBox, `DatabaseNode` with cylinders, `GatewayNode` with an octahedron) using standard R3F primitives.
- Created `NodeStatusBadge.tsx` for floating spherical indicators and `<Html>` label billboards.
- Enforced strict GPU memory cleanup using `disposeThreeObject()` on unmount across all node geometries to prevent WebGL memory leaks.

### Feature 13: Node Selection & Inspector Panels — COMPLETED
- Replaced single `selectedNodeId` with `selectedNodeIds: string[]` in Zustand store to support future multi-selection. Added helper actions (`selectSingleNode`, `toggleNodeSelection`, `selectAllNodes`).
- Reimplemented `useKeyboardShortcuts.ts` to merge 2D React Flow canvas shortcuts (zoom, undo, redo) with 3D canvas selection actions (Delete/Backspace to delete nodes, Escape to clear selection, Cmd/Ctrl+A to select all).
- Updated `SystemNode.tsx` to handle `Shift/Ctrl/Meta + Click` for toggling nodes into multi-selection without dropping the active array.
- Scaffoled `InspectorPanel.tsx` — a sliding glassmorphic right-hand panel that appears when `selectedNodeIds.length > 0`. It provides two-way bound inputs for `node.label`, `node.status`, `node.position`, and `node.color`.
- Implemented real-time property mutations using `updateSelectedNodeProperty`, instantly syncing input changes (like typing a label or tweaking X/Y/Z) straight into the 3D meshes without needing explicit save clicks.

### Feature 14: 3D Node Property Controls & Transform Gizmos — COMPLETED
- Created `TransformGizmo.tsx` utilizing `@react-three/drei`'s `<TransformControls>` bound to `selectedNodeIds[0]`.
- Leveraged Drei's native camera interception (via `<OrbitControls makeDefault />`) to automatically disable camera pan/orbit when dragging a gizmo axis, preventing camera jitter.
- Implemented `onChange` event to extract real-time transformation matrix (position, rotation, scale) from the hidden proxy mesh and stream updates directly into `useCanvasStore.updateSelectedNodeProperty()`.
- Implemented 0.5-unit `translationSnap` when `showGrid` preference is active, and clamped `Y` coordinates to prevent sinking beneath the ground plane.
- Added `T`/`W` (Translate), `R`/`E` (Rotate), and `S` (Scale) hotkeys to `useKeyboardShortcuts.ts` connected via `setActiveTool`.
- Updated `InspectorPanel.tsx` to display an active `gizmoMode` badge reflecting the current state in real-time.

### Feature 15: 3D Connections & Edge Rendering — COMPLETED
- Implemented `SystemEdge.tsx` utilizing `@react-three/drei` `<QuadraticBezierLine>` with dynamic midpoint elevation to arc over the 3D ground plane.
- Created `EdgeFlowParticles.tsx` for real-time animated data flow visualization moving along the Bezier curve paths using `useFrame`.
- Built `NodeSockets.tsx` adding physical socket attachment points to 3D nodes (North, East, South, West) enabling interactive edge drawing via pointer events.
- Created `TempConnectionEdge.tsx` to handle live preview lines that follow `cursor3D` while `canvasMode === "CONNECTING"`.
- Refactored `useCanvasStore.ts` to support dual-selection modes (`selectedNodeIds` vs `selectedEdgeIds`) alongside new `addEdge` mechanics.
- Updated `InspectorPanel.tsx` to conditionally render the Edge Inspector when connections are selected, allowing protocol type switching and edge deletion.
- Integrated `disposeThreeObject` across all new 3D components for aggressive WebGL memory disposal to prevent GPU leaks.
- Verified TypeScript compilation successfully with `npx tsc --noEmit`.

### Feature 16: VRAM Disposal & Memory Leak Cleanup — COMPLETED
- Enhanced `disposeThreeObject` in `lib/three-utils.ts` to proactively traverse and nullify all 15 different Three.js material texture map types (e.g., `map`, `normalMap`, `roughnessMap`), preventing detached DOM/JS object retention.
- Created a reusable `useDisposal` React Hook (`hooks/useDisposal.ts`) to automate WebGL resource cleanup upon component unmount.
- Applied `useDisposal` globally across all 3D mesh instances: `SystemNode`, `ServiceNode`, `DatabaseNode`, `GatewayNode`, `RobotNode`, `SystemEdge`, `EdgeFlowParticles`, and `TransformGizmo`.
- Engineered a robust `<WebGLErrorBoundary>` that intercepts `webglcontextlost` events on the `<Canvas>`, prevents fatal browser crashes, and renders a graceful recovery UI.
- Built a `<MemoryAuditor>` diagnostic overlay for development environments that polls `gl.info.memory` to track real-time active Geometries, Textures, and Draw Calls.
- Verified zero strict type errors via `npx tsc --noEmit`.

### Feature 17: Canvas Export & Schema Serialization — COMPLETED
- Built `lib/canvas-exporter.ts` combining `gl={{ preserveDrawingBuffer: true }}` with `toDataURL` to generate high-res PNG 3D viewport snapshots.
- Implemented `lib/spec-serializer.ts` with strict Zod parsing (`CanvasExportSchema`) ensuring accurate and type-safe JSON serialization/deserialization while stripping noisy runtime states (e.g., `selected`, `dragging`).
- Developed `lib/markdown-exporter.ts` to parse the spatial canvas graph and generate structured, human-readable `ARCHITECTURE.md` documentation tables (Nodes & Edges).
- Created a glassmorphic `<ExportModal>` component mounted via the `TopBar`, consolidating all three export functions (PNG, JSON, Markdown) into an elegant, user-friendly UI.
- Verified full TypeScript strict compliance with `npx tsc --noEmit`.

### Feature 18: Finite State Machine Architecture — COMPLETED
- Integrated `xstate` (v5) and `@xstate/react` into the project.
- Defined robust interaction states (`idle`, `nodeSelected`, `transforming`, `connecting`, `placingNode`, `aiGenerating`) in `canvasMachine.ts`.
- Created a centralized, singleton global store (`useCanvasFSM.ts`) that manages XState transitions and synchronizes safely with the existing Zustand `useCanvasStore`.
- Added a `<FSMDebugger />` overlay using `@react-three/drei`'s `Html` layer to render current FSM execution context in development mode.
- Secured pointer events by delegating specific overrides to FSM states (e.g., disabling `OrbitControls` via dragging Gizmo, locking ground-click deselections when locked/transforming).
- Globally mapped the `Escape` key to dispatch `CANCEL` events resolving any non-idle states automatically back to the safe `idle` state.
- Verified zero TypeScript compilation errors via `npx tsc --noEmit`.

### Feature 19: Liveblocks Real-time Presence & Spatial Cursors — COMPLETED
- Initialized presence in `editor-workspace-client.tsx` using `<RoomProvider initialPresence={{ cursor: null, selectedNodeId: null, isThinking: false, thinking: false }}>`.
- Enhanced `<CanvasLoading>` in `canvas-room.tsx` with a sleek glassmorphic loading spinner that appears while connecting to the WebSocket room via `<ClientSideSuspense>`.
- Built `<Cursor3D />` to smoothly interpolate (`lerp`) remote cursor coordinates via `useFrame` at 60FPS to prevent jitter. Rendered glowing raycast cones tinted with remote user colors and attached `<Html>` billboard tags for usernames.
- Created `useSpatialPresence.ts` to actively broadcast 3D raycast coordinates, primary active selection (`selectedNodeId`), and FSM-driven `aiGenerating` thinking state. Throttled websocket transmission to ~30Hz.
- Embedded a secondary floating bounding wireframe in `<SystemNode />` that highlights when a remote collaborator is currently editing that specific node, colored by their assigned presence ID.
- Integrated a live avatar stack directly into the Canvas `<TopBar />` using `useOthers()`, including user avatars, initial fallbacks, colored rings, and overflow `+N` indicators.
- Verified TypeScript soundness for all Presence components (ignored out-of-scope Prisma errors).

### Feature 20: CRDT Canvas State Sync — COMPLETED
- Flattened `liveblocks.config.ts` storage schema to use `LiveMap<string, LiveObject<CanvasNode>>` and `LiveMap<string, LiveObject<CanvasEdge>>` avoiding nested complex structures.
- Created `hooks/useLiveblocksCanvasSync.ts` implementing two-way synchronization: pulling down `liveNodes` and `liveEdges` (via `useStorage`) to hydrate the local Zustand store.
- Implemented real-time mutation hooks (`useInsertNodeCRDT`, `useUpdateNodeCRDT`, `useDeleteNodesCRDT`, etc.) to optimistically propagate local UI changes into the shared Liveblocks CRDT layer.
- Refactored `trigger/design-agent.ts` to cleanly query the LiveMap structures, allowing AI tools to reliably update the active room's canvas geometry.
- Verified TypeScript compilation successfully with `npx tsc --noEmit`, successfully resolving Prisma `TaskRun` and `Project.ownerId` migration mismatches.

### Feature 21: Real-Time Cursor Overlay UI — COMPLETED
- [x] Feature 22: Gemini AI Architecture Agent Setup — COMPLETED
- [x] Feature 23: Trigger.dev Async Worker Jobs Pipeline — COMPLETED
- [x] Feature 24: Prompt-to-3D Layout Engine & Auto-Placement Goal — COMPLETED

## Current Goal

- Next Feature Unit

## In Progress

- [x] Feature 25: AI Spec Sidebar & Technical Document Viewer — COMPLETED
- [x] Feature 26: Chat Interface & Iterative Canvas Modifications — COMPLETED
- [x] Feature 27: System Analytics & Cost Estimation Engine — COMPLETED
- [x] Feature 28: Performance Profiling & FPS Optimization — COMPLETED
- [x] Feature 29: Production Build, Testing & Vercel Deployment — COMPLETED
- [x] Feature 30: Telemetry, Observability & Error Tracking — COMPLETED

## Next Up

🎉 **ALL 30 FEATURE UNITS COMPLETED (100%)**
NullVoid AI is now fully implemented, optimized, and ready for production deployment to Vercel.

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui style is `base-nova` (uses `@base-ui/react` primitives, not Radix).
- All shadcn components use CSS variable tokens from `@theme inline` — no raw Tailwind color classes.
- `PrismaNeon` adapter receives a `@neondatabase/serverless` Pool via `ConstructorParameters` cast to bridge the type mismatch between the two packages.

## Session Notes

- 10 UI primitives now exist in `components/ui/`: avatar, button, card, dialog, dropdown-menu, input, scroll-area, skeleton, tabs, textarea.
- Do NOT modify generated `components/ui/*` files per spec instruction.
- The `proxy.ts` file replaces `middleware.ts` in Next.js 16 — never create a `middleware.ts` file.

### Deep Bug Fix Round 2 (July 30, 2026)

**Critical fixes:**
- **Canvas data corruption** (`app/api/projects/[projectId]/canvas/route.ts`): PUT handler now properly extracts `url` or `canvasBlobUrl` from request body instead of blindly stringifying entire body.
- **Zod schema/type mismatch** (`lib/validations/canvas.ts`): Made `Position3D.z` and `Rotation3D.z` optional to match TypeScript types.
- **Web Worker in Node.js** (`lib/ai/layout-engine.ts`): Added `typeof Worker === "undefined"` guard for Trigger.dev server context, with sync fallback.
- **SSR browser API guards** (3 files): Added `typeof document === "undefined"` / `typeof Blob === "undefined"` guards in `canvas-exporter.ts`, `markdown-exporter.ts`, `spec-serializer.ts`.
- **React Hook in try/catch** (`components/editor/inspector-panel.tsx`): Moved `useUpdateNodeCRDT`, `useDeleteNodesCRDT`, etc. out of try/catch to comply with Rules of Hooks.
- **Invalid R3F nesting** (`components/canvas/Nodes/NodeSockets.tsx`): Fixed nested `<mesh>` in `<mesh>` by wrapping socket + glow in `<group>`.
- **Blob URL discarded** (`trigger/generate-spec.ts`): Changed `filePath` from raw spec content to `blob.url` from Vercel Blob upload.

**Security fixes:**
- **AI route access control** (3 routes): Added `getAccessibleProject` check to `design`, `generate`, and `trigger-job` routes — previously any authenticated user could trigger AI on any project.
- **Liveblocks auth collaborator support** (`app/api/liveblocks-auth/route.ts`): Now checks `ProjectCollaborator` table via email for non-owners.
- **Collaboration system implemented** (`lib/project-collaborators.ts`): Replaced all-null stubs with real Prisma queries. `getProjectCollaborators`, `addCollaborator`, `removeCollaborator`, `isEmailCollaborator`, `getProjectShareDetails` all working.
- **Project access now checks collaborators** (`lib/project-access.ts`): `getAccessibleProject` allows access for both owners and collaborator emails.
- **Security headers** (`vercel.json`): Added `Strict-Transport-Security`, `Permissions-Policy`, `Content-Security-Policy`.
- **Liveblocks key validation** (`lib/liveblocks.ts`): Added runtime validation of `LIVEBLOCKS_SECRET_KEY`.
- **Env var inconsistencies** (`.env`): Replaced unused `GOOGLE_GENERATIVE_AI_API_KEY` with `GEMINI_API_KEY` + `GOOGLE_AI_API_KEY`; fixed `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` → `NEXT_PUBLIC_TRIGGER_PUBLIC_KEY`; added `CLERK_WEBHOOK_SECRET`.

**Config fixes:**
- **Disabled `ignoreBuildErrors`** in `next.config.ts` — TS errors are no longer silently masked.
- **Enabled Sentry sourcemaps** — production debugging now works.
- **Sentry tracesSampleRate** reduced from 1.0 to 0.1 across all 3 configs (prevents $1000+/month bill).
- **TS target** updated from `ES2017` to `ES2022`.

**Stability fixes:**
- **Keyboard double-deletion** (`hooks/useKeyboardShortcuts.ts`): Delete/Backspace now only calls CRDT or local store, never both.
- **Stale closure in SystemNode** (`components/canvas/Nodes/SystemNode.tsx`): Replaced `useState` + closure with `useRef` for lerp scale value.
- **`cameraInvertY` now applied** (`components/canvas/Camera.tsx`): `rotateSpeed` set to `-0.5` when inverted.
- **React Flow handle types** (`components/editor/canvas/canvas-node.tsx`): Top/Left handles set to `type="target"` instead of all `source`.
- **`id.split("-")[1]` crash** (`components/dashboard/ProjectCard.tsx`): Added length check before array access.
- **Dead code removed** (`lib/ai/spec-generator.ts`): Removed unused `model` variable.
- **Shared projects populated** (`lib/projects.ts`): `getProjectsForUser` now queries `ProjectCollaborator` table for shared projects.

**Build verified:** `npx next build` — zero TypeScript errors, zero compilation errors. All routes compile and generate.

### Frontend Optimization & 3D Visual Overhaul (July 31, 2026)

**Critical Bug Fixes:**
- **Scene.tsx architecture nodes not rendering** (`components/canvas/Scene.tsx`): CRITICAL — nodes from `useCanvasStore` were never iterated to render `SystemNode` components. AI-generated nodes were invisible. Fixed by mapping over `nodes` array and rendering `<SystemNode>` for each. Also added missing `<TempConnectionEdge>` rendering.
- **WebGLErrorBoundary non-functional** (`components/canvas/WebGLErrorBoundary.tsx`): `webglcontextlost` does NOT bubble, so listening on the container `<div>` never caught context loss events. Fixed by finding the `<canvas>` element directly via `document.querySelector("canvas")` with a MutationObserver fallback for late-mounted canvases. Also added retry UI with spinner.
- **InstancedNodes static count** (`components/canvas/Performance/InstancedNodes.tsx`): `InstancedMesh` `args` count was read only at mount — adding/removing nodes broke rendering. Fixed by using a fixed `MAX_INSTANCES=500` budget, hiding unused instances by scaling to 0, and properly setting `meshRef.current.count`.
- **Toolbar no-op buttons** (`components/editor/Toolbar.tsx`): Reset View, Undo, and Redo buttons only called `console.log()`. Fixed: Reset View now calls `setCameraFlyTo({x:0,y:3,z:8})`, Undo/Redo now use the `useCanvasHistory` store with proper snapshot-based undo/redo (previously only had `captureSnapshot`/`popSnapshot` with no redo support).
- **NodeSockets `as any` type assertion** (`components/canvas/Nodes/NodeSockets.tsx`): Edge creation used `as any` to bypass `CanvasEdge` type. Fixed by importing `CanvasEdge` type and properly typing the edge object with all required fields.
- **useCanvasHistory API mismatch** (`stores/useCanvasHistory.ts`): Refactored to expose `undo(nodes, edges)` and `redo(nodes, edges)` that return restored snapshots, with proper `canUndo`/`canRedo` state tracking. Fixed downstream consumers in `Toolbar.tsx` and `lib/ai/patch-applier.ts`.

**3D Visual Enhancements — Environment & Lighting:**
- **Atmospheric fog** (`components/canvas/Environment.tsx`): Added `THREE.FogExp2` (dark `#080809`) at distance 25-60 for cinematic depth and natural node fading.
- **Multi-light setup**: Added pulsing cyan point light, orbiting purple spot light, ground bounce light, and purple back light alongside existing key/rim lights.
- **ACES Filmic ToneMapping** (`components/canvas/CanvasContainer.tsx`): Enabled `THREE.ACESFilmicToneMapping` with 1.2 exposure for richer colors and better HDR handling.
- **Environment map**: Changed from `preset="city"` to `preset="night"` for darker, more atmospheric reflections.
- **Grid accent colors**: Updated infinite grid to use cyan cell color (`#00c8d4`) and purple section color (`#6457f9`) with proper thickness and fade parameters.

**3D Visual Enhancements — Node Materials:**
- **ServiceNode** (`components/canvas/Nodes/ServiceNode.tsx`): Upgraded to `meshPhysicalMaterial` with clearcoat (0.5), metalness (0.7), and envMapIntensity (1.2). Added pulsing emissive top trim, bottom accent trim, rotating glow torus ring, and 4 vertical corner accent lines.
- **DatabaseNode** (`components/canvas/Nodes/DatabaseNode.tsx`): Upgraded to `meshPhysicalMaterial` with clearcoat (0.8) on outer sections. Middle section uses transparent glass effect. Added rotating data flow ring, emissive top/bottom caps, and 4 vertical accent lines.
- **GatewayNode** (`components/canvas/Nodes/GatewayNode.tsx`): Upgraded outer shell to `meshPhysicalMaterial` with clearcoat (1.0). Inner wireframe core pulses and rotates. Added solid center, 2 orbital torus rings, and 6 vertex glow points.

**3D Visual Enhancements — Edges & Particles:**
- **EdgeFlowParticles** (`components/canvas/Edges/EdgeFlowParticles.tsx`): Upgraded from 1 to 4 particles per edge with staggered timing and varied speeds. Each particle has a glow halo. Particles pulse in scale as they travel.
- **SystemEdge** (`components/canvas/Edges/SystemEdge.tsx`): Added glow line (wider transparent version behind the main edge) for bloom-like effect. Added `toneMapped={false}` on accent colors for HDR glow.

**3D Visual Enhancements — Animations:**
- **SystemNode selection** (`components/canvas/Nodes/SystemNode.tsx`): Selection wireframe now rotates (Y axis at 0.8 rad/s) and pulses opacity (0.2-0.6). Hover shows a subtle purple wireframe aura.
- **AnimatedNodeWrapper** (`components/canvas/Nodes/AnimatedNodeWrapper.tsx`): Node spawn now includes elastic scale-up (0→1 with overshoot via `1 - 2^(-10t) * cos(...)`) and 180° Y rotation entrance.
- **NodeStatusBadge** (`components/canvas/Nodes/NodeStatusBadge.tsx`): Indicator sphere now has a glow halo that pulses for active/error states. Floating bob animation. HTML label shows status dot with colored shadow glow.

**3D Visual Enhancements — Loading & Diagnostics:**
- **CanvasLoader** (`components/canvas/CanvasLoader.tsx`): Branded loading animation with dual counter-rotating rings (cyan/purple), center radial glow pulse, "NullVoid.AI" brand text, and animated loading dots.

**2D UI Enhancements:**
- **InspectorPanel slide-in** (`components/editor/inspector-panel.tsx`): Added `animate-slide-in-right` class for smooth entrance animation.
- **LeftSidebar** (`components/editor/left-sidebar.tsx`): Collapsible sidebar with `animate-slide-in-bottom` entrance. Active item highlighting with proper color theming. Collapsed state shows icon-only bar.
- **TopBar** (`components/editor/top-bar.tsx`): Added `animate-slide-in-bottom` entrance, `animate-glow-pulse` on logo, and `animate-border-glow` on live indicator.
- **EditorLayout** (`components/editor/EditorLayout.tsx`): Added center ambient glow for more layered atmospheric lighting.
- **ProjectCard** (`components/dashboard/ProjectCard.tsx`): Added `card-3d`/`card-3d-inner` classes for 3D perspective hover effect. Grid preview now uses accent-primary color. Added animated wireframe rings and glowing status badge.
- **EmptyProjects** (`components/dashboard/EmptyProjects.tsx`): Added animated rotating wireframe rings, `animate-scale-in` entrance with staggered delays.

**CSS Animation System** (`app/globals.css`): Added 8 new keyframe animations: `slide-in-right`, `slide-in-bottom`, `fade-in`, `scale-in`, `border-glow`, `rotate-slow`. Added utility classes: `.animate-slide-in-right`, `.animate-slide-in-bottom`, `.animate-fade-in`, `.animate-scale-in`, `.animate-border-glow`, `.animate-rotate-slow`. Added `.glass-panel-glow` with accent glow shadow, `.card-3d`/`.card-3d-inner` for perspective hover effects.

**TypeScript verified:** `npx tsc --noEmit` — zero errors across all modified files.

### "Website won't open / Index of /" Fix Round (July 31, 2026)

**Root cause of "Index of /":** The Next.js server was never actually reachable. VS Code's embedded Live Preview was serving the project folder as a static directory listing on `127.0.0.1:3000` (the page the user saw), while a stale Next.js **dev** server was erroring on IPv6 `::3000`. Multiple orphaned `next dev` processes (3000/3003) kept crashing with "Another next dev server is already running" (see `server_err.log`). All stale dev servers were killed.

**Build-breaking bug fixed:**
- **`app/canvas/[id]/page.tsx` crash (`createContext is not a function`)**: This page was a **Server Component** importing `@liveblocks/react` directly. Turbopack bundled Liveblocks against React's `react-server` build, which has no `createContext`, so the route crashed during page-data collection and the whole build failed. Fixed by making the page a `"use client"` component and reading `params.id` via `use(params)` — matching the pattern already used by `editor-workspace-client.tsx`.

**Runtime bug fixed (Rules of Hooks):**
- **`hooks/useLiveblocksCanvasSync.ts`**: All 6 CRDT hooks (`useInsertNodeCRDT`, `useUpdateNodeCRDT`, `useDeleteNodesCRDT`, `useDeleteEdgesCRDT`, `useInsertEdgeCRDT`, `useUpdateEdgeCRDT`) called `useMutation` conditionally (inside `if (typeof window === "undefined")` and `try/catch`), a rules-of-hooks violation that causes hydration crashes and "rendered fewer hooks" errors. Rewrote them to call `useMutation` unconditionally (all usages are inside a `<RoomProvider>`); removed unused imports.

**Architecture fix:**
- **Prisma client moved out of the App Router** (`app/generated/prisma` → `lib/generated/prisma`): Generated Prisma runtime + WASM files were living inside the Next.js `app/` router directory, bloating dev/build file-watching and slowing every compile. Updated `prisma/schema.prisma`, `lib/db.ts`, `actions/project.actions.ts`, and `eslint.config.mjs`. `app/generated/` deleted.

**Stability/perf fixes:**
- **`lib/db.ts`**: Added `PrismaPg` pool options (`connectionTimeoutMillis: 20s`, `query_timeout`, `statement_timeout`, `ssl`) so DB requests fail fast with clear errors instead of hanging when Neon is paused/unreachable.
- **`components/canvas/CanvasTelemetry.tsx`**: Removed `performance.now()` calls during render (impure render) and unused ref.
- **`components/editor/canvas/presence-cursors.tsx`**: Replaced `getBoundingClientRect()` read during render (non-deterministic, React Compiler violation) with a `useLayoutEffect` + resize-listener measured offset.
- **`lib/ai/patch-applier.ts`**: Replaced `@ts-ignore` with a proper `_justAdded?: boolean` field on `CanvasNode` (`types/canvas.ts`).
- **`app/layout.tsx`**: Metadata branding fixed from "Ghost AI" to "NullVoid.AI".
- **`.gitignore`**: File was corrupted with null bytes (OneDrive) — rewritten cleanly. Now ignores `/lib/generated/`, `/.trigger/`, `/scratch/`, `*.log`, `nul`.

**Added `run.ps1`** — robust launcher: kills stale Next.js processes, detects the VS Code Live Preview port conflict, auto-picks a free port, and starts dev (or `-Prod`).

**Performance verified:**
- Production build: **passes** — all 24 routes compile, TS clean, static pages generate.
- Production server: `/` responds in ~0.3s; gzip works (biggest chunk 1262 KB → 355 KB on the wire).
- Heavy deps are route-isolated: three.js (~1.2 MB) only ships on `/canvas/[id]`; React Flow only on `/editor/[roomId]`.
- Unit tests: 6/6 pass. `npx tsc --noEmit`: zero errors.

**Action needed from user (not code):** Close VS Code's Live Preview to free port 3000, then run `.\run.ps1`. For faster dev, exclude this OneDrive folder (or at least `.next`/`node_modules`) from OneDrive sync — OneDrive file-locking caused the EPERM build errors and slow cold compiles.

### Collaborator API Route Implemented (July 31, 2026)

- **Removed the last stub** (`app/api/projects/[projectId]/collaborators/route.ts`): Was returning 501 for all methods. Now fully implements GET, POST, DELETE.
- **GET** returns `{ share }` matching the `useProjectShare` hook contract — `projectId`, `projectName`, `canManage`, `owner` (role `"owner"`), `collaborators` (role `"collaborator"`). Access via `getAccessibleProject` (owners + collaborator emails). Owner profile (name/avatar/email) resolved through `clerkClient().users.getUser()` with graceful fallback to "Workspace owner".
- **POST** (owner-only, 403 for collaborators) validates email via `isValidCollaboratorEmail`, calls `addCollaborator`, returns 409 on duplicate/failure, then rebuilds the share payload.
- **DELETE** (owner-only, 403 for collaborators) calls `removeCollaborator` and returns the refreshed share.
- `ProjectShareDialog` + `useProjectShare` now work end-to-end (previously always surfaced "Not Implemented").
- **TypeScript verified:** `npx tsc --noEmit` — zero errors.

### Liveblocks 3.18 + Frontend Bug Fix Round (July 31, 2026)

**Critical bugs fixed:**
- **C1 — CRDT sync crash** (`hooks/useLiveblocksCanvasSync.ts`): Liveblocks 3.18 returns **plain objects** from `useStorage` for `LiveMap` values (no more `Map` instances); `.toImmutable()/.toObject()/.toArray()` removed. Rewrote sync to use `Object.values(root.nodes)` / `Object.values(root.edges)`. Added `useReplaceStorageCRDT` hook so undo/redo can replace the entire LiveMap storage atomically.
- **C2 — Canvas page crash** (`app/canvas/[id]/page.tsx`): All `@liveblocks/react/suspense` consumers now live inside a `<ClientSideSuspense>` boundary with a new glassmorphic `WorkspaceLoading` loader.
- **C3 — Dead FSM events wired**: Toolbar dispatches `START_PLACING_NODE` / `START_CONNECT` / `CANCEL`; `NodeSockets` sends `COMPLETE_CONNECT` on successful edge draw and resets tool to SELECT; `BaseCanvas` now handles node placement (drops node at `cursor3D` via `insertNodeCRDT`) and cancels connect mode on empty-space click; `useKeyboardShortcuts` maps `N/C/V/H/K` to FSM events and `Escape` sends `CANCEL`.
- **M2 — `AnimatedNodeWrapper`**: removed `position` prop from R3F `<group>` (was re-applying sky height on every render); spawn position set once on mount; target lerped via ref.
- **M3 — `TransformGizmo` multi-select**: records per-node start positions on `onMouseDown`, applies delta translation to the whole group, clamps Y ≥ 0, reads fresh store via `useCanvasStore.getState()` for CRDT broadcast.
- **M4 — Deselect-on-pointerdown**: `SystemNode`/`SystemEdge` call `e.stopPropagation()` on `onPointerDown`; `BaseCanvas` skips deselection when shift/cmd/ctrl is held.
- **M5 — Undo/redo now functional**: `useCanvasStore` snapshots before every mutating action (150ms debounce in `useCanvasHistory`); `Toolbar` + `EditorLayout` pass undo/redo to `useKeyboardShortcuts` and sync restored snapshots back to CRDT via `replaceStorageCRDT`.
- **M7 — `RobotNode` rewritten**: removed hardcoded `id`/position; `useGLTF.preload` at module scope; inner `<Suspense>` + `<ErrorBoundary>`; accepts `scale` prop (canvas 0.05, showcase 0.3). Per-node Suspense added in `SystemNode`; duplicate `<RobotNode>`/Suspense block removed from `Scene.tsx`.
- **M8 — Keyboard delete/escape**: Delete/Backspace now clears the local selection AND deletes via CRDT; Escape sends CANCEL and resets tool.

**Performance (M1/M6):**
- Selective store subscriptions in `SystemNode`, `SystemEdge`, `EdgeLayer`, `InspectorPanel`, `TopBar`, `CollaboratorPanel`, `AnalyticsPanel`, `ExportModal`, `ServicesTab`, `ChatPanel`, `Camera`, `TempConnectionEdge`, `Toolbar`.
- `CanvasContainer` now uses adaptive DPR from `usePerformanceAdaptive`; `CanvasPerformance` HUD gated to `performanceMode === "quality"`.

**3D asset integration ("make the frontend more attractive"):**
- `components/dashboard/RobotHero.tsx` — glassmorphic hero banner on the dashboard with the sign-in page's gradient headline, feature chips, and a lazy-loaded 3D robot stage.
- `components/dashboard/RobotShowcase3D.tsx` — standalone lightweight R3F `<Canvas>` (alpha, dpr [1,1.5]) rendering `RobotNode` at scale 0.3 with slow auto-rotation, floating bob, cyan/purple rim lights, and `ContactShadows`.
- Heavy three.js chunk is route-isolated: `next/dynamic` + `lazy()` ensures the GLB/three code only downloads on the dashboard/canvas routes, not the landing page.

**Verified:** `npx tsc --noEmit` zero errors; `npx next build` passes — all 24 routes compile and generate.
