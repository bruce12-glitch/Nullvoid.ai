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

/**
 * SECURITY: preview bypass is opt-in AND non-production only.
 *
 * This previously also returned true when the Clerk keys merely *contained*
 * the substring "dummy"/"preview". A placeholder key left in a production
 * environment therefore disabled route protection for the entire app while
 * looking perfectly normal. Route protection must never hinge on the
 * incidental contents of a secret.
 */
function isPreviewBypass(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.PREVIEW_BYPASS_AUTH === "true"
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
