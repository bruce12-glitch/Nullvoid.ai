"use client";

import { useState } from "react";
import { Download, Image as ImageIcon, FileJson, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { captureCanvasSnapshot } from "@/lib/canvas-exporter";
import { exportCanvasToJSON, downloadJSONFile } from "@/lib/spec-serializer";
import { generateArchitectureMarkdown, downloadMarkdownFile } from "@/lib/markdown-exporter";

export function ExportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, edges } = useCanvasStore();

  const handleExportPNG = () => {
    captureCanvasSnapshot({ transparent: false });
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    const jsonString = exportCanvasToJSON(nodes, edges);
    downloadJSONFile(jsonString, `nullvoid-spec-${Date.now()}.json`);
    setIsOpen(false);
  };

  const handleExportMarkdown = () => {
    const mdString = generateArchitectureMarkdown(nodes, edges);
    downloadMarkdownFile(mdString, `ARCHITECTURE-${Date.now()}.md`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <Download className="w-4 h-4" />
      </DialogTrigger>
      
      {/* 
        Using bg-card/60 backdrop-blur-md for the glassmorphic effect as requested in ui-context.md.
        Note: The DialogContent from shadcn might already apply some background, we use Tailwind to override it. 
      */}
      <DialogContent className="sm:max-w-[500px] bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Export Architecture</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Save your system design artifacts to your local machine.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          
          <button 
            onClick={handleExportPNG}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/50 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="p-3 bg-primary/20 rounded-lg text-primary flex-shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">High-Res PNG Snapshot</h4>
              <p className="text-xs text-muted-foreground mt-1">Capture a screenshot of the current 3D viewport.</p>
            </div>
          </button>

          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/50 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-500 flex-shrink-0">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">JSON System Spec</h4>
              <p className="text-xs text-muted-foreground mt-1">Machine-readable serialized graph for re-importing.</p>
            </div>
          </button>

          <button 
            onClick={handleExportMarkdown}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-surface/50 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500 flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Architecture Markdown</h4>
              <p className="text-xs text-muted-foreground mt-1">Structured ARCHITECTURE.md documentation for GitHub.</p>
            </div>
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
