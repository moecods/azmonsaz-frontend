"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box } from '@mui/material';
import { DescriptiveGradingBands } from './DescriptiveGradingBands';
import { getDefaultDescriptiveConfig } from '@/lib/grading';

const meta: Meta<typeof DescriptiveGradingBands> = {
  title: 'آزمون/نمره‌دهی توصیفی',
  component: DescriptiveGradingBands,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'تنظیم پانگ‌های نمره توصیفی در مرحله تنظیمات ویزارد ساخت آزمون.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DescriptiveGradingBands>;

export const Default: Story = {
  render: function BandsDemo() {
    const [config, setConfig] = useState(getDefaultDescriptiveConfig());
    return (
      <Box sx={{ maxWidth: 640 }}>
        <DescriptiveGradingBands value={config} onChange={setConfig} />
      </Box>
    );
  },
};

export const CustomScale: Story = {
  render: function CustomBands() {
    const [config, setConfig] = useState({
      scale_max: 100,
      pass_min: 50,
      bands: [
        { label: 'عالی', min: 85, max: 100 },
        { label: 'خوب', min: 70, max: 85 },
        { label: 'متوسط', min: 50, max: 70 },
        { label: 'ضعیف', min: 0, max: 50 },
      ],
    });
    return (
      <Box sx={{ maxWidth: 640 }}>
        <DescriptiveGradingBands value={config} onChange={setConfig} />
      </Box>
    );
  },
};
