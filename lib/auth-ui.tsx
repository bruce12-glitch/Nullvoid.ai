"use client"

/**
 * Auth UI facade — real Clerk components when auth is configured
 * (NEXT_PUBLIC_AUTH_ENABLED === "true"), lightweight local stand-ins when not.
 */

import {
  UserButton as ClerkUserButton,
  UserProfile as ClerkUserProfile,
  useUser as clerkUseUser,
} from "@clerk/nextjs"

export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true"

/* ------------------------- solo fallbacks ------------------------- */

const SOLO_USER = {
  id: "preview_user_001",
  fullName: "Guest User",
  firstName: "Guest",
  lastName: "User",
  imageUrl: "",
  primaryEmailAddress: { emailAddress: "guest@nullvoid.ai" },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SoloUserButton(_props: any) {
  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[11px] font-bold text-white ring-2 ring-white/10 select-none"
      title="Guest User (solo mode)"
    >
      G
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SoloUserProfile(_props: any) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
      <p className="font-medium text-white">Guest profile</p>
      <p className="mt-1">Configure Clerk keys in .env to enable account management.</p>
    </div>
  )
}

function soloUseUser() {
  return { isLoaded: true, isSignedIn: true, user: SOLO_USER }
}

/* --------------------------- exports ------------------------------ */

export const UserButton = (AUTH_ENABLED ? ClerkUserButton : SoloUserButton) as typeof ClerkUserButton
export const UserProfile = (AUTH_ENABLED ? ClerkUserProfile : SoloUserProfile) as typeof ClerkUserProfile
export const useUser = (AUTH_ENABLED ? clerkUseUser : soloUseUser) as typeof clerkUseUser
