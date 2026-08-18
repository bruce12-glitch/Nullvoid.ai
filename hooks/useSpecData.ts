import { useEffect, useCallback } from "react";
import { useEventListener } from "@/lib/collab/suspense";
import { useSpecStore } from "@/stores/useSpecStore";
import { getLatestSpecForProject } from "@/app/actions/spec-actions";

export function useSpecData(projectId: string) {
  const { setSpec, setSidebarOpen } = useSpecStore();

  const fetchLatestSpec = useCallback(async () => {
    try {
      const spec = await getLatestSpecForProject(projectId);
      if (spec) {
        setSpec({
          id: spec.id,
          projectId: spec.projectId,
          filePath: spec.filePath,
          createdAt: spec.createdAt,
        });
      }
    } catch (error) {
      console.error("Failed to fetch latest spec:", error);
    }
  }, [projectId, setSpec]);

  // Initial fetch on mount
  useEffect(() => {
    if (projectId) {
      fetchLatestSpec();
    }
  }, [projectId, fetchLatestSpec]);

  // Listen for Liveblocks AI completion events to re-fetch automatically
  useEventListener(({ event }) => {
    const e = event as any;
    if (e.type === "ai-status" && e.status === "complete") {
      fetchLatestSpec().then(() => {
        // Automatically pop open the sidebar when AI finishes
        setSidebarOpen(true);
      });
    }
  });

  return { fetchLatestSpec };
}
