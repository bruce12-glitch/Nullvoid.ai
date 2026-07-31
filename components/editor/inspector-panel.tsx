"use client";

import { PanelRightClose, Settings2, Trash2, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useCanvasTools } from "@/hooks/useCanvasTools";
import { useUpdateNodeCRDT, useDeleteNodesCRDT, useUpdateEdgeCRDT, useDeleteEdgesCRDT } from "@/hooks/useLiveblocksCanvasSync";

const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#eab308", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#1f2937"
];

export function InspectorPanel() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useCanvasStore((s) => s.selectedEdgeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const updateSelectedNodeProperty = useCanvasStore((s) => s.updateSelectedNodeProperty);
  const updateSelectedEdgeProperty = useCanvasStore((s) => s.updateSelectedEdgeProperty);
  const deleteSelectedNodes = useCanvasStore((s) => s.deleteSelectedNodes);
  const deleteSelectedEdges = useCanvasStore((s) => s.deleteSelectedEdges);
  const { gizmoMode } = useCanvasTools();
  
  const updateNodeCRDT = useUpdateNodeCRDT();
  const deleteNodesCRDT = useDeleteNodesCRDT();
  const updateEdgeCRDT = useUpdateEdgeCRDT();
  const deleteEdgesCRDT = useDeleteEdgesCRDT();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateNode = (key: any, value: any) => {
    updateSelectedNodeProperty(key, value);
    selectedNodeIds.forEach(id => {
      updateNodeCRDT?.(id, { [key]: value });
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateEdge = (key: any, value: any) => {
    updateSelectedEdgeProperty(key, value);
    selectedEdgeIds.forEach(id => {
      updateEdgeCRDT?.(id, { [key]: value });
    });
  };

  if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return null;

  if (selectedNodeIds.length > 0) {
    const primaryNode = nodes.find(n => n.id === selectedNodeIds[0]);
    if (!primaryNode) return null;

    return (
      <div className="absolute top-22 bottom-24 right-4 w-80 flex flex-col bg-card/60 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl z-20 pointer-events-auto overflow-hidden text-card-foreground animate-slide-in-right">
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Properties</span>
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded capitalize">{gizmoMode}</span>
          </div>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
            <PanelRightClose className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Settings2 className="w-4 h-4" />
              <h3 className="text-sm font-medium">Node Details</h3>
            </div>
            <span className="bg-background/50 text-[10px] border border-border px-2 py-0.5 rounded-full">
              {selectedNodeIds.length > 1 ? `${selectedNodeIds.length} Selected` : primaryNode.type}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input 
                value={primaryNode.label || ""}
                onChange={(e) => handleUpdateNode("label", e.target.value)}
                placeholder="Node Name"
                className="h-8 bg-black/20 border-border/40 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select 
                value={primaryNode.status || "idle"} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(val) => handleUpdateNode("status", val as any)}
              >
                <SelectTrigger className="h-8 bg-black/20 border-border/40 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transform</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground pl-1">X</label>
                <Input 
                  type="number" step="0.5"
                  value={primaryNode.position.x} 
                  onChange={(e) => handleUpdateNode("position", { ...primaryNode.position, x: parseFloat(e.target.value) || 0 })}
                  className="h-7 bg-black/20 border-border/40 text-xs px-2" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground pl-1">Y</label>
                <Input 
                  type="number" step="0.5"
                  value={primaryNode.position.y} 
                  onChange={(e) => handleUpdateNode("position", { ...primaryNode.position, y: parseFloat(e.target.value) || 0 })}
                  className="h-7 bg-black/20 border-border/40 text-xs px-2" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground pl-1">Z</label>
                <Input 
                  type="number" step="0.5"
                  value={primaryNode.position.z || 0} 
                  onChange={(e) => handleUpdateNode("position", { ...primaryNode.position, z: parseFloat(e.target.value) || 0 })}
                  className="h-7 bg-black/20 border-border/40 text-xs px-2" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</h3>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className={`w-full aspect-square rounded-md border-2 transition-transform hover:scale-110 ${primaryNode.color === color ? 'border-primary' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleUpdateNode("color", color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50" 
              onClick={() => {
                if (selectedNodeIds.length > 0) {
                  deleteNodesCRDT?.(selectedNodeIds);
                }
                deleteSelectedNodes();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node{selectedNodeIds.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (selectedEdgeIds.length > 0) {
    const primaryEdge = edges.find(e => e.id === selectedEdgeIds[0]);
    if (!primaryEdge) return null;

      return (
      <div className="absolute top-22 bottom-24 right-4 w-80 flex flex-col bg-card/60 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl z-20 pointer-events-auto overflow-hidden text-card-foreground animate-slide-in-right">
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Edge Properties</span>
          </div>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
            <PanelRightClose className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <GitMerge className="w-4 h-4" />
              <h3 className="text-sm font-medium">Connection Details</h3>
            </div>
            <span className="bg-background/50 text-[10px] border border-border px-2 py-0.5 rounded-full">
              {selectedEdgeIds.length > 1 ? `${selectedEdgeIds.length} Selected` : primaryEdge.type}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input 
                value={primaryEdge.label || ""}
                onChange={(e) => handleUpdateEdge("label", e.target.value)}
                placeholder="Edge Label"
                className="h-8 bg-black/20 border-border/40 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Protocol Type</Label>
              <Select 
                value={primaryEdge.type || "SYNC_HTTP"} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(val) => handleUpdateEdge("type", val as any)}
              >
                <SelectTrigger className="h-8 bg-black/20 border-border/40 text-sm">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYNC_HTTP">Sync HTTP</SelectItem>
                  <SelectItem value="ASYNC_EVENT">Async Event</SelectItem>
                  <SelectItem value="GRPC">gRPC</SelectItem>
                  <SelectItem value="WEBSOCKET">WebSocket</SelectItem>
                  <SelectItem value="DATABASE_CONNECTION">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50" 
              onClick={() => {
                if (selectedEdgeIds.length > 0) {
                  deleteEdgesCRDT?.(selectedEdgeIds);
                }
                deleteSelectedEdges();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Connection{selectedEdgeIds.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
