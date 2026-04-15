import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    // Cobertura mínima para MVP
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "prisma/**",
        "scripts/**",
        "src/app/**",          // rotas Next.js — testadas via integração
        "src/components/**",
        "src/hooks/**",
        "src/types/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",         // re-exports
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
      },
    },
    // Excluir arquivos de setup e definições de tipo
    exclude: ["node_modules", ".next", "src/types/**"],
  },
});
