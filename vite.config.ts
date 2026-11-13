/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // The browser calls /api; the Express proxy (npm run dev:server) talks to Yahoo Finance.
    proxy: { '/api': 'http://localhost:3001' },
  },
  // Recharts alone is ~500 kB minified; revisit with code-splitting if the bundle grows.
  build: { chunkSizeWarningLimit: 700 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**', 'server/**'],
      // Entry points, type-only files and the thin yahoo-finance2 adapter (covered by `npm run smoke:yahoo`).
      exclude: [
        '**/*.test.*',
        'src/test/**',
        'src/main.tsx',
        'src/**/*.css',
        'src/domain/types.ts',
        'server/index.ts',
        'server/providers/yahooClient.ts',
      ],
      reporter: ['text-summary', 'text'],
      thresholds: {
        // Transformation logic is the part most worth protecting.
        'src/domain/**': { statements: 90, branches: 85, functions: 90, lines: 90 },
        'server/**': { statements: 85, lines: 85 },
        'src/services/**': { statements: 85, lines: 85 },
      },
    },
  },
});
