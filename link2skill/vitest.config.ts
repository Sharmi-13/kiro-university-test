import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Node environment — tests have no browser/DOM dependency
    environment: "node",
    // Glob covering all property-based and unit test files
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    // Minimum 100 iterations is enforced inside each test via fast-check
    // numCPUs / reporter / coverage options left at defaults intentionally
  },
  resolve: {
    // Mirror the "@/*" path alias from tsconfig.json so imports work in tests
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
