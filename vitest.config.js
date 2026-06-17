import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'starlight-demo/**',
        'astro-demo/**',
        'test/**',
        '*.config.js',
        '*.d.ts'
      ]
    }
  }
});