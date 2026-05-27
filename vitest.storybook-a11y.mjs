/**
 * Vitest config جدا برای a11y — نباید دو storybookTest در یک workspace باشد
 * (نام پروژه تکراری: storybook:<configDir>).
 */
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            tags: {
              include: ['autodocs'],
              exclude: ['test', 'skip-a11y'],
            },
          }),
        ],
        test: {
          name: 'storybook-a11y',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
        optimizeDeps: {
          include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  css: {
    postcss: false,
  },
});
