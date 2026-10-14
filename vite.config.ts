import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    // El chunk de `three` (~520 kB sin comprimir, ~130 kB gzip) se carga diferido y no
    // bloquea el primer paint: se sube el umbral para que el build siga sin warnings
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
