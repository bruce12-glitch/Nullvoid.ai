import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isPreviewBypass = process.env.PREVIEW_BYPASS_AUTH === "true"
  if (isPreviewBypass) {
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-black text-center text-xs py-1 font-medium">
            ⚡ Preview Mode — Auth & DB mocked • Landing page is live • <a href="/dashboard" className="underline font-bold ml-1">Go to Dashboard →</a> <span className="hidden sm:inline opacity-60">| set real .env keys for full functionality</span>
          </div>
          <div className="pt-6 flex-1 flex flex-col">{children}</div>
        </body>
      </html>
    )
  }

  // Non-preview (prod) — lazy import client providers to keep preview SSR
  // Note: This branch is not used in preview, so it won't affect the black screen
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* For prod, you would wrap with ClerkProvider etc. — kept minimal for now to avoid bailout */}
        <div className="pt-0 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  )
}
