# NullVoid AI 

NullVoid AI is a real-time collaborative 3D & 2D system design workspace. Users describe a system in plain English, and an AI agent maps that system onto a shared interactive canvas live. Collaborators can refine the architecture together, and the application generates a comprehensive Markdown technical specification document from the resulting graph. 

This project was built utilizing a "spec-driven agentic development" methodology, combining human architectural design with AI coding agents executing precise implementation units.

## ⚡ Two Runtime Modes

NullVoid degrades gracefully based on which services you configure:

| Capability | SOLO mode (no keys) | FULL mode (all keys) |
|---|---|---|
| Authentication | Local guest identity | Clerk accounts |
| Canvas editing | ✅ Local state + DB autosave | ✅ Liveblocks CRDT multiplayer |
| AI architecture generation | ✅ Inline in the API route | ✅ Trigger.dev background jobs |
| AI spec generation | ✅ Inline + stored in PostgreSQL | ✅ Background + Vercel Blob |
| Live cursors / presence | — | ✅ |

**Only two things are strictly required: a PostgreSQL database and a Google Gemini API key.** Everything else upgrades automatically when its key appears in `.env` (service detection lives in `lib/runtime.ts`, the client facade in `lib/collab/`).


## 🛠 Tech Stack

* **Frontend:** Next.js 16, React 19, Tailwind CSS v4, and shadcn/ui.
* **3D Rendering & WebGPU:** Three.js, React Three Fiber (`@react-three/fiber`), and `@react-three/drei`.
* **Authentication & User Management:** Clerk.
* **Multiplayer & Canvas:** Liveblocks and React Flow (`@xyflow/react`).
* **Database:** PostgreSQL managed via Prisma ORM.
* **Storage:** Vercel Blob (for canvas snapshots and Markdown specs).
* **Background Tasks & AI Agents:** Trigger.dev.
* **AI Integration:** Vercel AI SDK and Google Gemini (`gemini-2.0-flash`).

## ✨ Key Features

* **Real-Time Collaborative Workspace:** Multiple users can connect to a shared room via WebSockets to edit the same canvas. The environment features live presence, avatars, and synced cursors.
* **Interactive 3D & 2D Architecture Canvas:** Supports WebGPU hardware acceleration with automatic WebGL2 fallback for rendering interactive 3D system nodes and 2D canvas layouts.
* **AI Architecture Generation:** Describe a system (e.g., "design an e-commerce backend"), and a Trigger.dev background task will generate the required nodes, edges, and architecture layout on the canvas in real-time.
* **Automated Tech Specs:** The app takes the active canvas state and chat history, synthesizes it, and generates a downloadable Markdown technical specification.
* **Rich Node Interaction:** Users can drag-and-drop shapes, resize elements while maintaining aspect ratios, edit labels inline, change background/text colors via a floating toolbar, and connect custom edges from any side.
* **Project Management & Access Control:** Secure routes ensure only authorized users can enter a workspace. Owners can invite collaborators via email, and non-owners are restricted from destructive actions like renaming or deleting projects.
* **Starter Templates:** Users can import pre-built architecture diagrams—such as microservices, CI/CD pipelines, or event-driven systems—to kickstart their design.
* **Autosave:** Canvas states automatically persist as JSON data inside Vercel Blob storage, keeping your database lean.

## 🧠 Spec-Driven Context System

NullVoid AI is designed to be built and maintained by AI coding agents using a 6-file context system located in the `/context` folder:

1. **`project_overview.md`**: Outlines the product goals, target audience, core user flows, and deliberately out-of-scope features.
2. **`architecture-context.md`**: Defines the tech stack, 3D/2D rendering layer boundaries, and invariants the codebase must never break.
3. **`code-standards.md`**: Enforces strict styling, Next.js, and TypeScript conventions.
4. **`ai-workflow-rules.md`**: Keeps the agent disciplined, dictating that it must work on one feature unit or subsystem at a time.
5. **`ui-context.md`**: Holds the design tokens and component rules to ensure the UI remains visually coherent across agent sessions.
6. **`progress-tracker.md`**: The agent's memory bank, constantly updated with the current phase, completed work, and architectural decisions made along the way.

## 🚀 Getting Started

### Quick start (SOLO mode)
```bash
bash scripts/dev-setup.sh   # provisions local PostgreSQL + migrations + deps
cp .env.example .env        # add DATABASE_URL and GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create an `.env` file in the root directory (refer to `.env.example`).

**Required:**
* **Prisma / PostgreSQL:** `DATABASE_URL`
* **Google AI Studio:** `GOOGLE_GENERATIVE_AI_API_KEY`

**Optional (enables FULL mode):**
* **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
* **Liveblocks:** `LIVEBLOCKS_SECRET_KEY`
* **Vercel Blob:** `BLOB_READ_WRITE_TOKEN`
* **Trigger.dev:** `TRIGGER_SECRET_KEY`

### 3. Database Initialization
Generate the Prisma client and push your schema to the database:
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the Development Server
Start the Next.js frontend:
```bash
npm run dev
```

### 5. Run the Trigger.dev Worker
In a separate terminal tab, start the local worker to process background AI tasks:
```bash
npx trigger.dev@latest dev
```
