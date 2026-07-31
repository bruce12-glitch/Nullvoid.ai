"use client";

import { useSpecStore } from "@/stores/useSpecStore";
import { useSpecData } from "@/hooks/useSpecData";
import { PanelLeftClose, PanelLeft, Copy, Download, Layers } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "./SpecViewers/OverviewTab";
import { ServicesTab } from "./SpecViewers/ServicesTab";
import { SecurityTab } from "./SpecViewers/SecurityTab";
import { InfraTab } from "./SpecViewers/InfraTab";


interface SpecSidebarProps {
  projectId: string;
}

export function SpecSidebar({ projectId }: SpecSidebarProps) {
  useSpecData(projectId); // Initialize data syncing
  const { currentSpec, isSidebarOpen, toggleSidebar } = useSpecStore();

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="absolute top-24 left-4 z-20 p-2 bg-bg-surface/80 backdrop-blur-md border border-border-default/40 rounded-lg shadow-lg text-text-primary hover:bg-bg-surface-elevated transition-colors"
      >
        <PanelLeft className="w-5 h-5" />
      </button>
    );
  }

  // Parse the spec filePath as JSON content
  let parsedSpec: any = null;
  try {
    if (currentSpec?.filePath) {
      parsedSpec = JSON.parse(currentSpec.filePath);
    }
  } catch (e) {
    // filePath may be plain text, not JSON - treat as raw markdown
    if (currentSpec?.filePath) {
      parsedSpec = { overview: { description: currentSpec.filePath }, specification: {} };
    }
  }

  const handleCopy = () => {
    if (parsedSpec) {
      navigator.clipboard.writeText(JSON.stringify(parsedSpec, null, 2));
      // Visual feedback via temporary button highlight (no external toast dep needed)
      const btn = document.getElementById("spec-copy-btn");
      if (btn) { btn.classList.add("text-state-success"); setTimeout(() => btn.classList.remove("text-state-success"), 1500); }
    }
  };

  const handleDownload = () => {
    if (parsedSpec) {
      const blob = new Blob([JSON.stringify(parsedSpec, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "architecture-spec.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="absolute top-24 left-72 z-20 w-96 h-[calc(100vh-8rem)] flex flex-col bg-card/60 backdrop-blur-xl border border-border-default/40 rounded-2xl shadow-2xl p-4 text-card-foreground animate-in slide-in-from-left-4 duration-300 pointer-events-auto">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent-primary" />
          <h2 className="font-semibold text-text-primary tracking-wide">System Spec</h2>
          <span className="text-[10px] ml-1 px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-mono">
            v1.0 AI
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button id="spec-copy-btn" onClick={handleCopy} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface-elevated rounded-md transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface-elevated rounded-md transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={toggleSidebar} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface-elevated rounded-md transition-colors ml-1">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {parsedSpec ? (
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 bg-bg-surface-elevated/50 p-1 rounded-lg mb-4">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-bg-surface">Overview</TabsTrigger>
            <TabsTrigger value="services" className="text-xs data-[state=active]:bg-bg-surface">Services</TabsTrigger>
            <TabsTrigger value="security" className="text-xs data-[state=active]:bg-bg-surface">Security</TabsTrigger>
            <TabsTrigger value="infra" className="text-xs data-[state=active]:bg-bg-surface">Infra</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden relative">
            <TabsContent value="overview" className="h-full m-0 data-[state=inactive]:hidden">
              <OverviewTab overview={parsedSpec.overview} />
            </TabsContent>
            
            <TabsContent value="services" className="h-full m-0 data-[state=inactive]:hidden">
              <ServicesTab services={parsedSpec.specification?.services || []} />
            </TabsContent>

            <TabsContent value="security" className="h-full m-0 data-[state=inactive]:hidden">
              <SecurityTab security={parsedSpec.specification?.security || {}} />
            </TabsContent>

            <TabsContent value="infra" className="h-full m-0 data-[state=inactive]:hidden">
              <InfraTab infra={parsedSpec.specification?.infrastructure || {}} />
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
          {currentSpec?.filePath === "generation-in-progress" ? (
            <p className="text-sm animate-pulse">Generation in progress...</p>
          ) : (
            <p className="text-sm text-center">No specification available.<br/>Generate one using the AI tool.</p>
          )}
        </div>
      )}
    </div>
  );
}
