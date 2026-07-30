import { useCanvasStore } from "@/stores/useCanvasStore";
import { Badge } from "@/components/ui/badge";

import { canvasFSMActor } from "@/hooks/useCanvasFSM";

interface ServicesTabProps {
  services: any[];
}

export function ServicesTab({ services }: ServicesTabProps) {
  const { nodes, hoverNode, selectSingleNode } = useCanvasStore();

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 pb-4">
      {services.map((service, index) => {
        // Find corresponding node ID in canvas store by label
        const nodeMatch = nodes.find(n => n.label === service.name);

        return (
          <div
            key={index}
            className="bg-bg-surface border border-border-default rounded-xl p-3 cursor-pointer hover:border-accent-primary transition-colors"
            onMouseEnter={() => nodeMatch && hoverNode(nodeMatch.id)}
            onMouseLeave={() => hoverNode(null)}
            onClick={() => {
              if (nodeMatch) {
                selectSingleNode(nodeMatch.id);
                canvasFSMActor.send({ type: "SELECT_NODE" });
              }
            }}
          >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-text-primary text-sm">{service.name}</span>
            <Badge variant="outline" className="text-[10px] uppercase border-accent-primary/40 text-accent-primary">{service.type}</Badge>
          </div>
          <p className="text-xs text-text-muted mb-3">{service.description}</p>
          <div className="flex flex-wrap gap-1">
            {service.techStack.map((tech: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-[9px] bg-bg-surface-elevated">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}
