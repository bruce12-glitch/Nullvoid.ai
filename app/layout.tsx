import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { LenisProvider } from "@/components/providers/LenisProvider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Satoshi-like geometric sans for Novify exact — Space Grotesk is closest via next/font
const satoshi = Space_Grotesk({
  variable: "--font-satoshi",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "NullVoid.AI",
  description: "Real-time collaborative system design workspace",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isPreviewBypass = process.env.PREVIEW_BYPASS_AUTH === "true"
  // In preview mode with dummy Clerk keys, skip ClerkProvider to avoid runtime key validation errors
  if (isPreviewBypass) {
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-black text-center text-xs py-1 font-medium">
            ⚡ Preview Mode — Auth & DB mocked • Landing page is live • <a href="/dashboard" className="underline font-bold ml-1">Go to Dashboard →</a> <span className="hidden sm:inline opacity-60">| set real .env keys for full functionality</span>
          </div>
          <div className="pt-6 flex-1 flex flex-col">
            {/* In preview, render children without dynamic ClientProviders to allow SSR (fixes black screen when HMR blocked) */}
            <LenisProvider>{children}</LenisProvider>
          </div>
        </body>
      </html>
    )
  }
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "transparent",
              colorNeutral: "var(--foreground)",
              colorPrimary: "#3b82f6",
              colorPrimaryForeground: "#ffffff",
              colorForeground: "var(--foreground)",
              colorInput: "var(--card)",
              colorDanger: "var(--destructive)",
              colorSuccess: "#34d399",
              colorWarning: "#fbbf24",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              card: "bg-card/60 backdrop-blur-md border border-border/40 shadow-2xl rounded-2xl",
              navbar: "bg-transparent",
              headerTitle: "text-foreground font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-secondary text-secondary-foreground border border-border/40 hover:bg-secondary/80",
              formButtonPrimary: "bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white font-medium",
              footerActionLink: "text-[#3b82f6] hover:underline",
            },
          }}
        >
          <LenisProvider>
            <ClientProviders>{children}</ClientProviders>
          </LenisProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
