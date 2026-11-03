import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Node 22 does not list `sqlite` in module.builtinModules (Node 23.5+ does), so Vite tries to bundle
// `node:sqlite` for the jsdom environment. Keep it external so tests behave the same on every Node.
const externalNodeSqlite = {
  name: 'external-node-sqlite',
  enforce: 'pre' as const,
  resolveId: (id: string) => (id === 'node:sqlite' ? { id, external: true } : null),
};

export default defineConfig({
  plugins: [externalNodeSqlite, tailwindcss(), svelte()],
  resolve: {
    ...(process.env.VITEST ? { conditions: ['browser'] } : {}),
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup-dom.ts'],
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
