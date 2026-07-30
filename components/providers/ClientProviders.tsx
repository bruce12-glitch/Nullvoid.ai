"use client";

import dynamic from "next/dynamic"
import { TooltipProvider } from "@/components/ui/tooltip"

const PostHogProvider = dynamic(
  () => import("@/components/providers/PostHogProvider").then((m) => ({ default: m.PostHogProvider })),
  { ssr: false }
)

const WebVitalsReporter = dynamic(
  () => import("@/app/performance-reporter").then((m) => ({ default: m.WebVitalsReporter })),
  { ssr: false }
)

import { SettingsProvider } from "@/components/settings/SettingsProvider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <TooltipProvider>
        {children}
        <SettingsProvider />
        <WebVitalsReporter />
      </TooltipProvider>
    </PostHogProvider>
  )
}
