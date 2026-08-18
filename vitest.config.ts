import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // @ts-ignore - plugin-react types might mismatch but it works
  plugins: [react()],
  test: {
    // Current unit tests are pure logic (validations, cost engine) — run in
    // the node environment. jsdom v30 requires Node >= 22 (undici
    // markAsUncloneable) and crashes the worker pool on Node 20.
    environment: "node",
    globals: true,
    include: ["__tests__/unit/**/*.test.ts", "__tests__/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
