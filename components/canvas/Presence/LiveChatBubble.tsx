"use client";

import { useEffect, useRef, useState } from "react";
import { useBroadcastEvent } from "@/lib/collab/suspense";

export function LiveChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const broadcast = useBroadcastEvent();

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an existing input
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
        return;
      }
      
      if (e.key === "/") {
        e.preventDefault();
        setPos(mousePos.current);
        setMessage("");
        setIsOpen(true);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      broadcast({ type: "CHAT_MESSAGE", message: message.trim() });
    }
    setIsOpen(false);
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-[100] animate-in zoom-in-95 duration-150"
      style={{ left: pos.x, top: pos.y + 16 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          placeholder="Say something..."
          className="bg-bg-surface/80 backdrop-blur-md border border-border-default/40 rounded-full px-3 py-1.5 shadow-xl text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary w-48 placeholder:text-text-muted"
        />
      </form>
    </div>
  );
}
