"use client";

import { Suspense, lazy } from "react";
import { Sparkles, MousePointerClick, ShieldCheck } from "lucide-react";

const RobotShowcase3D = lazy(() =>
  import("./RobotShowcase3D").then((m) => ({ default: m.RobotShowcase3D }))
);

export function RobotHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md">
      {/* Ambient glows */}
      <div className="absolute -top-24 left-1/3 w-96 h-72 bg-accent-primary/10 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-accent-ai/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="relative grid lg:grid-cols-2 gap-6 items-center">
        {/* Copy */}
        <div className="p-8 lg:pl-10 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary-dim border border-accent-primary/20 text-accent-primary text-xs font-medium mb-5 animate-fade-in">
            <Sparkles className="w-3 h-3" />
            AI-Powered System Design
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4 animate-fade-in" style={{ animationDelay: "80ms" }}>
            Design systems at the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-ai-text to-accent-primary bg-[length:200%_auto] animate-gradient-shift">
              speed of thought.
            </span>
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-6 animate-fade-in" style={{ animationDelay: "160ms" }}>
            Describe your architecture in plain English. AI maps it to a live
            3D canvas your whole team can refine in real time.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "240ms" }}>
            <span className="inline-flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-accent-primary" />
              Drag, connect & inspect nodes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-ai-text" />
              Live collaborative rooms
            </span>
          </div>
        </div>

        {/* 3D robot showcase */}
        <div className="relative h-56 sm:h-72 lg:h-[340px] min-h-[220px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Suspense
              fallback={
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-2 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
                  <span className="text-xs text-muted-foreground">Booting robot...</span>
                </div>
              }
            >
              <RobotShowcase3D />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
