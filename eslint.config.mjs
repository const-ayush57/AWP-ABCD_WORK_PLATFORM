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
    // Generated/package artifacts:
    ".next-release/**",
    ".next-prod/**",
    ".next-run/**",
    "dist/**",
    "dist-release/**",
    "dist-v*/**",
    "FINAL_APP_RELEASE/**",
    "cpp-desktop/build/**",
    "electron/**",
    "scripts/**",
    "test-cpp-db.js",
    "test-spawn.js",
    "src/wailsjs/**",
  ]),
]);

export default eslintConfig;
