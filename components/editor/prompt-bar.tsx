"use client";

import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PromptBar() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10 pointer-events-auto">
      <div className="flex items-center gap-2 p-1.5 bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl shadow-2xl text-card-foreground">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-2/20 shrink-0">
          <Sparkles className="w-5 h-5 text-chart-2" />
        </div>
        
        <Input 
          placeholder="Describe what you want to build or modify..." 
          className="flex-1 h-10 bg-transparent border-0 shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-sm"
        />
        
        <Button size="icon" className="h-10 w-10 rounded-xl shrink-0 bg-chart-2 hover:bg-chart-2/90 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
