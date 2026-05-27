import type { Preview } from '@storybook/nextjs-vite';
import '@/theme/loadVazirmatnFont';
import 'react-multi-date-picker/styles/layouts/mobile.css';
import 'react-multi-date-picker/styles/colors/purple.css';
import React from 'react';
import { StorybookDecorator } from './StorybookDecorator';

const isCi = Boolean(process.env.CI);

const preview: Preview = {
  globalTypes: {
    colorMode: {
      name: 'تم',
      description: 'حالت روشن یا تاریک (مثل اپ)',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'روشن', icon: 'sun' },
          { value: 'dark', title: 'تاریک', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorMode: 'light',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
    docs: {
      toc: true,
    },
    a11y: {
      // در CI نقض جدی accessibility باعث fail تست‌ها می‌شود
      test: isCi ? 'error' : 'todo',
    },
  },
  decorators: [
    (Story, { globals }) => (
      <StorybookDecorator colorMode={globals.colorMode === 'dark' ? 'dark' : 'light'}>
        <Story />
      </StorybookDecorator>
    ),
  ],
};

export default preview;
