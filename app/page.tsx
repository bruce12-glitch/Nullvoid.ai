import { UxPilotLanding } from "@/components/uxpilot/UxPilotLanding";

export default async function Home() {
  const isPreview = process.env.PREVIEW_BYPASS_AUTH === "true";
  let isAuthenticated = isPreview;
  if (!isPreview) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { userId } = await auth();
      isAuthenticated = !!userId;
    } catch {
      isAuthenticated = false;
    }
  }
  return <UxPilotLanding isPreview={isAuthenticated} />;
}
