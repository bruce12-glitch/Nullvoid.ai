import { SignUp } from "@clerk/nextjs"
import { BrainCircuit, Share2, ScrollText, Sparkles, Cpu, GitBranch, Shield } from "lucide-react"

const features = [
  {
    icon: BrainCircuit,
    title: "AI Architecture Generation",
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: ScrollText,
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent-primary/5 blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-ai/5 blur-[120px] animate-float" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-state-success/5 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex w-1/2 flex-col bg-bg-surface/80 border-r border-border-default relative backdrop-blur-sm">
        <div className="px-12 pt-10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-ai flex items-center justify-center shrink-0 shadow-lg shadow-accent-primary/20">
              <span
                className="text-bg-base font-bold text-sm leading-none"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                N
              </span>
            </div>
            <span className="text-base font-semibold text-text-primary tracking-tight">
              NullVoid<span className="text-accent-primary">.AI</span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-12 py-16">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary-dim border border-accent-primary/20 text-accent-primary text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />
              AI-Powered System Design
            </div>
            <h1 className="text-4xl font-bold text-text-primary leading-tight tracking-tight mb-5">
              Design systems at the
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-ai-text to-accent-primary bg-[length:200%_auto] animate-gradient-shift">
                speed of thought.
              </span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed mb-12 max-w-sm">
              Describe your architecture in plain English. AI maps it to a
              shared canvas your whole team can refine in real time.
            </p>
          </div>

          <ul className="space-y-6 max-w-sm">
            {features.map(({ icon: Icon, title, description }, i) => (
              <li key={title} className="flex items-start gap-4 group" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="shrink-0 h-10 w-10 rounded-xl bg-accent-primary-dim flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors duration-300 ring-1 ring-accent-primary/10 group-hover:ring-accent-primary/30">
                  <Icon className="h-5 w-5 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {title}
                  </p>
                  <p className="text-sm text-text-muted mt-1 leading-snug">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-12 pb-10 flex items-center justify-between">
          <p className="text-xs text-text-faint">
            &copy; 2026 NullVoid.AI. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-text-faint">
            <GitBranch className="w-3 h-3" />
            <Cpu className="w-3 h-3" />
            <Shield className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex flex-1 lg:w-1/2 items-center justify-center p-8 bg-bg-base relative">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-ai flex items-center justify-center shrink-0 shadow-lg shadow-accent-primary/20">
              <span className="text-bg-base font-bold text-sm leading-none">N</span>
            </div>
            <span className="text-base font-semibold text-text-primary tracking-tight">
              NullVoid<span className="text-accent-primary">.AI</span>
            </span>
          </div>
          <SignUp />
        </div>
      </div>
    </main>
  )
}
