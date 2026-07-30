import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export function generateArchitectureMarkdown(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  projectTitle: string = "NullVoid Architecture"
): string {
  const timestamp = new Date().toISOString();

  let markdown = `# ${projectTitle}\n\n`;
  markdown += `> Generated on: ${timestamp}\n\n`;

  markdown += `## System Architecture Overview\n\n`;
  markdown += `This document details the automatically generated technical specifications for the system architecture designed in NullVoid AI. The system consists of ${nodes.length} structural components and ${edges.length} interconnected data flows.\n\n`;

  markdown += `## Services & Infrastructure Breakdown\n\n`;
  if (nodes.length === 0) {
    markdown += `No services are currently defined in the architecture.\n\n`;
  } else {
    markdown += `| ID | Component Name | Type | Status |\n`;
    markdown += `|---|---|---|---|\n`;
    nodes.forEach((node) => {
      const typeLabel = node.type.replace(/_/g, " ");
      const statusLabel = node.status ? node.status.toUpperCase() : "IDLE";
      markdown += `| \`${node.id}\` | **${node.label || "Unnamed Component"}** | ${typeLabel} | ${statusLabel} |\n`;
    });
    markdown += `\n`;
  }

  markdown += `## Data Flow & Inter-Service Connections\n\n`;
  if (edges.length === 0) {
    markdown += `No connections are currently defined in the architecture.\n\n`;
  } else {
    markdown += `| Source | Target | Protocol / Type | Description |\n`;
    markdown += `|---|---|---|---|\n`;
    edges.forEach((edge) => {
      const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
      const targetNode = nodes.find(n => n.id === edge.targetNodeId);
      const sourceName = sourceNode?.label || edge.sourceNodeId;
      const targetName = targetNode?.label || edge.targetNodeId;
      const protocol = edge.type.replace(/_/g, " ");
      const label = edge.label || "N/A";
      
      markdown += `| ${sourceName} | ${targetName} | \`${protocol}\` | ${label} |\n`;
    });
    markdown += `\n`;
  }

  markdown += `## Security & Protocol Specifications\n\n`;
  markdown += `*This section will be populated dynamically by the AI Trigger.dev worker based on context analysis of the above components.* \n\n`;
  
  return markdown;
}

/**
 * Downloads a Markdown string as a file to the user's local disk.
 */
export function downloadMarkdownFile(markdown: string, filename?: string) {
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `ARCHITECTURE-${Date.now()}.md`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
