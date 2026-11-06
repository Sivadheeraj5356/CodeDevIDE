import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@': root },
  },
  test: {
    // Convex function tests run in the edge runtime via their docblock;
    // everything else stays in node.
    include: ['lib/__tests__/**/*.test.{js,jsx}', 'data/__tests__/**/*.test.{js,jsx}', 'convex-tests/**/*.test.{js,jsx}'],
  },
});
