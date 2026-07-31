import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"
import { ClientProviders } from "@/components/providers/ClientProviders"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
          <ClientProviders>
            {children}
          </ClientProviders>
        </ClerkProvider>
      </body>
    </html>
  )
}
