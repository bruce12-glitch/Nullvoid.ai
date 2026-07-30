"use client";

import { useEventListener } from "@liveblocks/react/suspense";
import { useState, useEffect } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-card/70 backdrop-blur-md border border-primary/40 text-card-foreground rounded-xl shadow-2xl z-30 animate-in fade-in slide-in-from-top-4 duration-300">
      {status === "start" || status === "thinking" ? (
        <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
      ) : status === "complete" ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : status === "error" ? (
        <AlertCircle className="w-5 h-5 text-red-500" />
      ) : (
        <Sparkles className="w-5 h-5 text-accent-primary" />
      )}
      
      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-wide">Ghost AI Architect</span>
        <span className="text-xs text-text-muted">{message || "Working..."}</span>
      </div>
    </div>
  );
}
