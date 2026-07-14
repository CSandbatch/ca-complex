import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts"],
    coverage: { reporter: ["text", "json-summary"] },
  },
  resolve: { alias: { "@": new URL("./", import.meta.url).pathname } },
});
