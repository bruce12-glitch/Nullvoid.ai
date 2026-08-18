import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { hasClerk } from "@/lib/runtime"
import "./globals.css"

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
  title: {
    default: "NullVoid.AI — AI-Powered Collaborative System Design",
    template: "%s · NullVoid.AI",
  },
  description:
    "Describe your architecture in plain English. NullVoid's AI maps it onto a real-time collaborative canvas and exports complete Markdown technical specs.",
  keywords: ["system design", "architecture diagrams", "AI", "collaboration", "technical specs"],
  openGraph: {
    title: "NullVoid.AI — Design systems at the speed of thought",
    description:
      "AI-generated architecture diagrams on a real-time collaborative canvas, with one-click Markdown spec exports.",
    type: "website",
    siteName: "NullVoid.AI",
  },
}

function FontShell({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // SOLO mode — Clerk not configured. The app runs with a local guest
  // identity; all features work for a single user.
  if (!hasClerk()) {
    return (
      <FontShell>
        <div className="fixed top-0 inset-x-0 z-[9999] bg-gradient-to-r from-blue-600 to-violet-600 text-white text-center text-xs py-1 font-medium">
          ⚡ Solo Mode — running without external accounts ·{" "}
          <a href="/dashboard" className="underline font-semibold">
            Open Dashboard →
          </a>{" "}
          <span className="hidden sm:inline opacity-70">
            | add Clerk, Liveblocks &amp; Trigger.dev keys in .env for multiplayer
          </span>
        </div>
        <div className="pt-6 flex-1 flex flex-col">{children}</div>
      </FontShell>
    )
  }

  // FULL mode — wrap the app with Clerk.
  const { ClerkProvider } = await import("@clerk/nextjs")
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#0a0a0f",
          borderRadius: "0.75rem",
        },
      }}
    >
      <FontShell>
        <div className="flex-1 flex flex-col">{children}</div>
      </FontShell>
    </ClerkProvider>
  )
}
