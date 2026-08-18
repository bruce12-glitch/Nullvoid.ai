"use client";

import { useCanvasPreferences } from "@/hooks/useCanvasPreferences";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserProfile } from "@/lib/auth-ui";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, User, Monitor, Key, Sparkles } from "lucide-react";

export function SettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    showGrid,
    setShowGrid,
    enableShadows,
    setEnableShadows,
    performanceMode,
    setPerformanceMode,
    autoSaveInterval,
    setAutoSaveInterval,
    cameraInvertY,
    setCameraInvertY,
    geminiModel,
    setGeminiModel,
  } = useCanvasPreferences();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="max-w-4xl max-h-[85vh] h-full p-0 flex flex-col gap-0 bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-background/40">
          <DialogTitle className="flex items-center gap-2 text-xl tracking-tight text-foreground">
            <Settings className="w-5 h-5 text-accent-primary" />
            Workspace Settings
          </DialogTitle>
          <DialogDescription className="sr-only">Configure your workspace preferences and profile.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <Tabs defaultValue="profile" className="w-full flex h-full">
            {/* Vertical Tabs Sidebar */}
            <div className="w-64 border-r border-border/40 bg-background/20 p-4">
              <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                <TabsTrigger 
                  value="profile" 
                  className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
                >
                  <User className="w-4 h-4" />
                  Profile & Account
                </TabsTrigger>
                <TabsTrigger 
                  value="rendering" 
                  className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
                >
                  <Monitor className="w-4 h-4" />
                  3D Canvas & Performance
                </TabsTrigger>
                <TabsTrigger 
                  value="editor" 
                  className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
                >
                  <Key className="w-4 h-4" />
                  Editor Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="w-full justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
                >
                  <Sparkles className="w-4 h-4" />
                  AI & Spec Engine
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs Content Area */}
            <div className="flex-1 overflow-hidden bg-background/30">
              <ScrollArea className="h-full">
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="m-0 border-none outline-none">
                  {/* We use Clerk's UserProfile but customize appearance so it blends in */}
                  <div className="flex justify-center min-h-[500px] w-full">
                    <UserProfile 
                      appearance={{
                        elements: {
                          rootBox: "w-full max-w-none rounded-none shadow-none bg-transparent",
                          cardBox: "w-full rounded-none shadow-none bg-transparent border-0",
                          navbar: "hidden", // Hide Clerk's own sidebar since we have tabs
                          pageScrollBox: "px-8 py-6",
                          headerTitle: "text-foreground font-semibold",
                          headerSubtitle: "text-muted-foreground",
                          profileSectionTitleText: "text-foreground font-medium",
                          profileSectionPrimaryButton: "text-accent-primary hover:bg-accent-primary/10",
                          badge: "bg-accent-primary/20 text-accent-primary",
                        }
                      }}
                    />
                  </div>
                </TabsContent>

                {/* 3D Canvas & Performance Tab */}
                <TabsContent value="rendering" className="m-0 p-8 space-y-8 outline-none">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-6">Rendering Preferences</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Show Grid</Label>
                          <p className="text-sm text-muted-foreground">Display the infinite ground grid in the 3D viewport.</p>
                        </div>
                        <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Enable Shadows</Label>
                          <p className="text-sm text-muted-foreground">Render contact shadows and directional light shadows.</p>
                        </div>
                        <Switch checked={enableShadows} onCheckedChange={setEnableShadows} />
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-6">
                        <div className="space-y-0.5">
                          <Label className="text-base">Performance Mode</Label>
                          <p className="text-sm text-muted-foreground">Balance between visual fidelity and framerate.</p>
                        </div>
                        <Select value={performanceMode} onValueChange={(v: "quality" | "performance" | null) => v && setPerformanceMode(v)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quality">High Quality</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Editor Preferences Tab */}
                <TabsContent value="editor" className="m-0 p-8 space-y-8 outline-none">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-6">Workspace Settings</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-save Interval</Label>
                          <p className="text-sm text-muted-foreground">How often your canvas and specs automatically save.</p>
                        </div>
                        <Select value={autoSaveInterval.toString()} onValueChange={(v) => v && setAutoSaveInterval(parseInt(v))}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-6">
                        <div className="space-y-0.5">
                          <Label className="text-base">Invert Y-Axis Camera</Label>
                          <p className="text-sm text-muted-foreground">Invert mouse movement for orbit controls pitch.</p>
                        </div>
                        <Switch checked={cameraInvertY} onCheckedChange={setCameraInvertY} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* AI & Spec Engine Tab */}
                <TabsContent value="ai" className="m-0 p-8 space-y-8 outline-none">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-6">AI Agent Settings</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Generative Model</Label>
                          <p className="text-sm text-muted-foreground">The LLM model used for architectural spec generation.</p>
                        </div>
                        <Select value={geminiModel} onValueChange={(v) => v && setGeminiModel(v)}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
