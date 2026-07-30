"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Bot, User, X, Minimize2, Maximize2, Sparkles, RotateCcw, Send } from "lucide-react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasHistory, } from "@/stores/useCanvasHistory";
import { applyDeltaPatches, revertLastPatch } from "@/lib/ai/patch-applier";
import type { DeltaPatchResponse } from "@/lib/ai/canvas-differ";

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  deltaResponse?: DeltaPatchResponse;
  isLoading?: boolean;
}

// ── Quick suggestion chips ────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Add a Redis Cache layer",
  "Add Kafka message queue",
  "Scale auth service to multi-region",
  "Add a CDN for the frontend",
];

// ── ChatPanel component ───────────────────────────────────────────────────────
export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI architecture assistant. Describe any modification you'd like to make to the canvas topology and I'll apply precise delta patches without disturbing the rest of your design.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { nodes, edges } = useCanvasStore();
  const { canUndo } = useCanvasHistory();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cmd/Ctrl + K hotkey to open and focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setIsMinimized(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };

    const thinkingMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat-modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, nodes, edges }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");
      const delta: DeltaPatchResponse = await res.json();

      // Apply delta patches to the canvas store
      applyDeltaPatches(delta.patches);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: delta.summary,
        deltaResponse: delta,
      };

      // Replace the loading message
      setMessages((prev) => [...prev.slice(0, -1), assistantMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${error.message ?? "Something went wrong. Please try again."}`,
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, isLoading]);

  const handleRevert = useCallback(() => {
    const success = revertLastPatch();
    if (success) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "✓ Canvas reverted to previous state.",
        },
      ]);
    }
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-accent-ai/90 backdrop-blur-md border border-accent-ai/30 rounded-2xl shadow-2xl text-white hover:bg-accent-ai transition-all pointer-events-auto group"
      >
        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">AI Modify</span>
        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div
      className={`absolute bottom-6 right-6 z-30 flex flex-col bg-card/70 backdrop-blur-xl border border-border-default/40 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-300 ${
        isMinimized ? "w-72 h-14" : "w-96 h-[480px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-ai/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent-ai-text" />
          </div>
          <span className="text-sm font-semibold text-text-primary">AI Canvas Modifier</span>
        </div>
        <div className="flex items-center gap-1">
          {canUndo && (
            <button
              onClick={handleRevert}
              title="Revert AI changes"
              className="p-1.5 text-text-muted hover:text-state-warning rounded-md hover:bg-bg-surface-elevated transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-bg-surface-elevated transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-text-muted hover:text-state-error rounded-md hover:bg-bg-surface-elevated transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                {msg.role !== "system" && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user" ? "bg-state-success/20" : "bg-accent-ai/20"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3 h-3 text-state-success" />
                    ) : (
                      <Bot className="w-3 h-3 text-accent-ai-text" />
                    )}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-state-success/15 text-text-primary rounded-tr-sm"
                      : msg.role === "system"
                      ? "bg-bg-surface border border-border-default/50 text-text-muted rounded-lg text-center w-full text-[11px]"
                      : "bg-bg-surface text-text-primary rounded-tl-sm"
                  }`}
                >
                  {msg.isLoading ? (
                    <span className="flex items-center gap-1 text-text-muted">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-75">●</span>
                      <span className="animate-bounce delay-150">●</span>
                    </span>
                  ) : (
                    <>
                      {msg.content}
                      {/* Rationale collapsible */}
                      {msg.deltaResponse && (
                        <p className="mt-1.5 text-text-muted text-[10px] border-t border-border-default/30 pt-1.5">
                          {msg.deltaResponse.rationale}
                        </p>
                      )}
                      {/* Show patch count */}
                      {msg.deltaResponse && (
                        <span className="inline-flex items-center mt-1.5 gap-1 px-1.5 py-0.5 bg-accent-primary/10 text-accent-primary text-[9px] rounded font-mono">
                          {msg.deltaResponse.patches.length} patch{msg.deltaResponse.patches.length !== 1 ? "es" : ""} applied
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestion chips */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-bg-surface border border-border-default/50 text-text-muted hover:text-text-primary hover:border-accent-primary/40 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-2 p-2 bg-bg-surface rounded-xl border border-border-default/50 focus-within:border-accent-primary/40 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Describe a modification..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 flex items-center justify-center bg-accent-ai rounded-lg text-white hover:bg-accent-ai/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
