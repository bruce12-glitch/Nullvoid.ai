"use client";

import { useEventListener } from "@liveblocks/react/suspense";
import { useState, useEffect } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIGenerationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<"start" | "thinking" | "complete" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEventListener(({ event }) => {
    const e = event as any;
    if (e.type === "ai-status") {
      setIsVisible(true);
      setStatus(e.status);
      setMessage(e.message);
    }
  });

  useEffect(() => {
    if (status === "complete" || status === "error") {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setStatus(null);
        setMessage("");
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 backdrop-blur-xl border rounded-2xl shadow-2xl z-30 transition-all duration-500 animate-in fade-in slide-in-from-top-4 zoom-in-95",
      status === "error" 
        ? "bg-state-error/10 border-state-error/30" 
        : status === "complete"
          ? "bg-state-success/10 border-state-success/30"
          : "bg-accent-ai/10 border-accent-ai/30"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center",
        status === "start" || status === "thinking"
          ? "bg-accent-ai/20" 
          : status === "complete"
            ? "bg-state-success/20"
            : "bg-state-error/20"
      )}>
        {status === "start" || status === "thinking" ? (
          <Loader2 className="w-4 h-4 text-accent-ai-text animate-spin" />
        ) : status === "complete" ? (
          <CheckCircle2 className="w-4 h-4 text-state-success" />
        ) : (
          <AlertCircle className="w-4 h-4 text-state-error" />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wide text-text-primary">AI Architect</span>
        <span className="text-[11px] text-text-muted">{message || "Working..."}</span>
      </div>
    </div>
  );
}
