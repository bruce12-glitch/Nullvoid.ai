import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// We intentionally avoid top-level clerk validation when in preview bypass mode.
// Clerk's publishable key validation happens inside clerkMiddleware on every request,
// so we must NOT invoke clerkMiddleware at all when using dummy keys.
const publicPaths = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/health",
  "/api/webhooks/clerk",
]

function isPreviewBypass(): boolean {
  return (
    process.env.PREVIEW_BYPASS_AUTH === "true" ||
    !process.env.CLERK_SECRET_KEY ||
    (process.env.CLERK_SECRET_KEY?.includes("dummy") ?? false) ||
    (process.env.CLERK_SECRET_KEY?.includes("preview") ?? false) ||
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("dummy") ?? false)
  )
}

// Lazily create the clerk middleware handler only when not in bypass mode
let clerkHandler: ((req: NextRequest) => Promise<NextResponse | void>) | null = null
async function getClerkHandler(): Promise<(req: NextRequest) => Promise<NextResponse | void>> {
  if (clerkHandler) return clerkHandler
  const { clerkMiddleware } = await import("@clerk/nextjs/server")
  clerkHandler = clerkMiddleware(async (auth, request) => {
    const path = request.nextUrl.pathname
    const isPublic = publicPaths.some((p) => path === p || path.startsWith(p + "/"))
    if (!isPublic) {
      await auth.protect()
    }
  }) as unknown as (req: NextRequest) => Promise<NextResponse | void>
  return clerkHandler
}

export default async function middleware(request: NextRequest) {
  if (isPreviewBypass()) {
    return NextResponse.next()
  }
  const handler = await getClerkHandler()
  // @ts-ignore - clerk handler expects NextRequest
  return handler(request)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
