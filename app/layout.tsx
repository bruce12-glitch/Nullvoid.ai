import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ClientProviders } from "@/components/providers/ClientProviders"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const satoshi = Space_Grotesk({
  variable: "--font-satoshi",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "NULLVOID.AI",
  description: "AI-powered system design and architecture diagramming",
}

const fontClasses = `${geistSans.variable} ${geistMono.variable} ${satoshi.variable} h-full antialiased`

/**
 * Preview bypass is opt-in AND non-production only, matching the rules in
 * `proxy.ts` and `lib/project-access.ts`. In that mode Clerk is not mounted,
 * so Clerk-dependent client hooks must not be rendered.
 */
function isPreviewBypass(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.PREVIEW_BYPASS_AUTH === "true"
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const body = (
    <body className="min-h-full flex flex-col">
      {isPreviewBypass() ? (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-black text-center text-xs py-1 font-medium">
          ⚡ Preview Mode — Auth &amp; DB mocked •{" "}
          <a href="/dashboard" className="underline font-bold ml-1">
            Go to Dashboard →
          </a>
        </div>
      ) : null}
      <div className={`${isPreviewBypass() ? "pt-6" : "pt-0"} flex-1 flex flex-col`}>
        <ClientProviders>{children}</ClientProviders>
      </div>
    </body>
  )

  // Preview mode: no Clerk keys are configured, so mounting ClerkProvider
  // would throw on boot. Auth-dependent UI is not reachable in this mode.
  if (isPreviewBypass()) {
    return (
      <html lang="en" className={fontClasses}>
        {body}
      </html>
    )
  }

  // Production / normal development: Clerk MUST wrap the tree. Without it,
  // every `useUser`/`useAuth`/`<UserButton>` in the app throws at render and
  // `<SignIn>` cannot mount, making sign-in impossible.
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "var(--color-bg-base)",
          colorNeutral: "var(--color-text-primary)",
          colorPrimary: "var(--color-accent-primary)",
          colorPrimaryForeground: "var(--color-bg-base)",
          colorForeground: "var(--color-text-primary)",
          colorInput: "var(--color-bg-elevated)",
          colorInputForeground: "var(--color-text-primary)",
          colorDanger: "var(--color-state-error)",
          colorSuccess: "var(--color-state-success)",
          colorWarning: "var(--color-state-warning)",
          borderRadius: "var(--radius)",
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      <html lang="en" className={fontClasses}>
        {body}
      </html>
    </ClerkProvider>
  )
}
