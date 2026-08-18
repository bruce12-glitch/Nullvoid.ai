import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "app/generated/**",
    "lib/generated/**",
    // Trigger.dev build cache — generated bundles, not source. Linting these
    // produced ~23,000 spurious problems and drowned out real findings.
    ".trigger/**",
  ]),
]);

export default eslintConfig;
