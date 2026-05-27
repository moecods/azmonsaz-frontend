import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const storybookBrowser = {
  enabled: true,
  headless: true,
  provider: playwright({}),
  instances: [{ browser: 'chromium' }],
};

const storybookOptimizeDeps = {
  include: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
  ],
};

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/mock-data.ts', '**/dev-utils.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', '**/dist/**'],
        },
      },
      {
        extends: true,
        plugins: [
          // فقط یک بار storybookTest — نام پروژه Vitest از configDir ساخته می‌شود
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            tags: {
              include: ['test'],
            },
          }),
        ],
        test: {
          name: 'storybook',
          browser: storybookBrowser,
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
        optimizeDeps: storybookOptimizeDeps,
      },
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  css: {
    modules: {
      classNameStrategy: 'non-scoped',
    },
    postcss: false,
  },
  optimizeDeps: {
    exclude: ['@tailwindcss/postcss'],
  },
});
