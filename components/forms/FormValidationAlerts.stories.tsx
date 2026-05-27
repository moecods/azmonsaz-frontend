"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Stack, Box } from '@mui/material';
import { FormValidationAlerts } from './FormValidationAlerts';

const meta: Meta<typeof FormValidationAlerts> = {
  title: 'فرم/هشدار اعتبارسنجی',
  component: FormValidationAlerts,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'لیست خطاهای فرم قبل از ارسال — بالای فرم یا sticky بالای دکمه‌ها.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FormValidationAlerts>;

const SAMPLE_ERRORS = [
  'عنوان آزمون الزامی است.',
  'تاریخ برگزاری را انتخاب کنید.',
  'حداقل درصد قبولی باید بین ۰ تا ۱۰۰ باشد.',
];

export const Top: Story = {
  args: {
    messages: SAMPLE_ERRORS,
    variant: 'top',
  },
};

export const Sticky: Story = {
  render: function StickyDemo() {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={{ minHeight: 320, position: 'relative' }}>
        <FormValidationAlerts
          messages={open ? SAMPLE_ERRORS : null}
          variant="sticky"
          onClose={() => setOpen(false)}
        />
        <Box sx={{ mt: 4, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          محتوای فرم (اسکرول کنید تا sticky را ببینید)
        </Box>
      </Box>
    );
  },
};

export const Empty: Story = {
  args: {
    messages: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'وقتی خطایی نیست، چیزی رندر نمی‌شود.',
      },
    },
  },
};

export const SingleMessage: Story = {
  args: {
    messages: ['لطفاً حداقل یک سوال به آزمون اضافه کنید.'],
  },
};
