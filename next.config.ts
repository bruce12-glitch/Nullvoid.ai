import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
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
  // `typescript.ignoreBuildErrors` was previously true, which silently shipped
  // real type errors (including a missing Prisma client and wrong Liveblocks
  // storage keys). The tree is clean now, so let the build enforce it.
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
    // SECURITY: these permissive framing headers exist only so the app can be
    // shown inside the sandboxed dev preview iframe. Emitting them in
    // production would override the hardened `X-Frame-Options: DENY` in
    // vercel.json (a CSP `frame-ancestors *` beats X-Frame-Options), leaving
    // the app open to clickjacking. So: dev/preview only.
    const isPreview =
      process.env.NODE_ENV !== "production" ||
      process.env.PREVIEW_BYPASS_AUTH === "true";

    if (!isPreview) return [];

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.e2b.app https://e2b.app https://*.arena.ai https://arena.ai https://*.arena.so https://arena.so http://localhost:* http://127.0.0.1:*",
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
