import { defineConfig } from 'vitest/config';

// Vitest configuration for Electron/Node tests
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // No setup files for node tests
    include: ['electron/**/*.test.js'],
  },
});
