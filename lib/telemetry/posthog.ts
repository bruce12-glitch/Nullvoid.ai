import posthog from "posthog-js";

export const initPostHog = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We'll handle this manually in Next.js
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
    });
  }
};

export const trackProjectCreated = (projectId: string, templateType: string = "blank") => {
  posthog.capture("project_created", { projectId, templateType });
};

export const trackAiGenerationTriggered = (promptLength: number, outputTokens: number = 0) => {
  posthog.capture("ai_generation_triggered", { promptLength, outputTokens });
};

export const trackCanvasExported = (format: "PNG" | "JSON" | "Markdown") => {
  posthog.capture("canvas_exported", { format });
};

export const trackCollaborationSessionJoined = (collaboratorCount: number) => {
  posthog.capture("collaboration_session_joined", { collaboratorCount });
};
