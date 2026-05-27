"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stack, Typography, Box } from '@mui/material';
import { RichTextField } from './RichTextField';

const meta: Meta<typeof RichTextField> = {
  title: 'فرم/متن غنی',
  component: RichTextField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ویرایشگر HTML ساده برای دستورالعمل آزمون و توضیحات. در `ExamSettingsStep` استفاده می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RichTextField>;

export const Default: Story = {
  render: function RichTextDemo() {
    const [value, setValue] = useState('');
    return (
      <Box sx={{ maxWidth: 520 }}>
        <RichTextField
          label="دستورالعمل آزمون"
          value={value}
          onChange={setValue}
          placeholder="قوانین و نحوه پاسخ‌دهی را بنویسید..."
          helperText="از دکمه‌های بالا برای بولد، لیست و... استفاده کنید."
        />
      </Box>
    );
  },
};

export const WithContent: Story = {
  render: function RichTextFilled() {
    const [value, setValue] = useState(
      '<p><strong>قوانین:</strong></p><ul><li>استفاده از ماشین‌حساب مجاز نیست.</li><li>پاسخ تشریحی را کامل بنویسید.</li></ul>'
    );
    return (
      <Box sx={{ maxWidth: 520 }}>
        <RichTextField
          label="دستورالعمل"
          value={value}
          onChange={setValue}
        />
      </Box>
    );
  },
};

export const WithError: Story = {
  render: function RichTextError() {
    const [value, setValue] = useState('');
    return (
      <Box sx={{ maxWidth: 520 }}>
        <RichTextField
          label="دستورالعمل"
          value={value}
          onChange={setValue}
          error
          helperText="متن دستورالعمل الزامی است."
        />
      </Box>
    );
  },
};

export const TallEditor: Story = {
  render: function RichTextTall() {
    const [value, setValue] = useState('');
    return (
      <Stack spacing={1} sx={{ maxWidth: 520 }}>
        <RichTextField
          label="توضیحات تکمیلی"
          value={value}
          onChange={setValue}
          minHeight={200}
        />
        <Typography variant="caption" color="text.secondary">
          ارتفاع بیشتر برای متن‌های طولانی
        </Typography>
      </Stack>
    );
  },
};
