import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  env: {
    // Build-time service flags: client bundles switch between FULL mode
    // (Liveblocks/Clerk/Trigger.dev) and SOLO mode (local fallbacks).
    NEXT_PUBLIC_COLLAB_ENABLED: process.env.LIVEBLOCKS_SECRET_KEY?.startsWith("sk_") ? "true" : "false",
    NEXT_PUBLIC_AUTH_ENABLED: process.env.CLERK_SECRET_KEY?.startsWith("sk_") ? "true" : "false",
    NEXT_PUBLIC_TRIGGER_ENABLED:
      process.env.TRIGGER_SECRET_KEY && process.env.LIVEBLOCKS_SECRET_KEY?.startsWith("sk_") ? "true" : "false",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow Arena preview host to fetch dev HMR/assets (fixes black screen in preview)
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@clerk/nextjs",
      "@clerk/ui",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@xyflow/react",
      "lodash",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow embedding in Arena preview iframe (e2b.app + arena.ai) — fix white page with document icon
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.e2b.app https://e2b.app https://*.arena.ai https://arena.ai https://*.arena.so https://arena.so http://localhost:* http://127.0.0.1:* *",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(
  analyzer(nextConfig),
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
    sourcemaps: {
      disable: false,
    },
  }
);
