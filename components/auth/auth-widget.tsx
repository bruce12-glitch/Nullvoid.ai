import Link from "next/link"
import { ArrowRight, UserRound } from "lucide-react"
import { hasClerk } from "@/lib/runtime"

/**
 * Renders the Clerk auth widget in FULL mode, or a guest-access card in
 * SOLO mode (no CLERK_SECRET_KEY configured).
 */
export async function AuthWidget({ mode }: { mode: "sign-in" | "sign-up" }) {
  if (hasClerk()) {
    const { SignIn, SignUp } = await import("@clerk/nextjs")
    return mode === "sign-in" ? <SignIn /> : <SignUp />
  }

  return (
    <div className="rounded-2xl border border-border-default/40 bg-bg-surface/70 backdrop-blur-md p-8 shadow-2xl">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/15">
        <UserRound className="h-6 w-6 text-accent-primary" />
      </div>
      <h2 className="text-center text-lg font-semibold text-text-primary">
        {mode === "sign-in" ? "Welcome back" : "Create your workspace"}
      </h2>
      <p className="mt-2 text-center text-sm text-text-muted leading-relaxed">
        NullVoid is running in <span className="text-accent-primary font-medium">Solo Mode</span> —
        no account needed. Jump straight into the workspace as a guest.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Continue as Guest
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-4 text-center text-[11px] text-text-faint leading-relaxed">
        To enable real accounts and multiplayer, add your Clerk keys to <code>.env</code> and restart.
      </p>
    </div>
  )
}
