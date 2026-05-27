"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Box, Stack, Typography } from '@mui/material';
import { RichTextEditor } from '@/components/editor';

const meta: Meta<typeof RichTextEditor> = {
  title: 'ویرایشگر/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ویرایشگر TipTap — متن فارسی، فرمول، تصویر. در ساخت سوال استفاده می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Empty: Story = {
  render: function EditorEmpty() {
    const [value, setValue] = useState('');
    return (
      <Box sx={{ maxWidth: 640 }}>
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder="متن سوال را بنویسید…"
          ariaLabel="متن سوال"
        />
      </Box>
    );
  },
};

export const WithPersianContent: Story = {
  render: function EditorFilled() {
    const [value, setValue] = useState(
      '<p><strong>سؤال:</strong> مساحت دایره‌ای با شعاع <em>r</em> را بنویسید.</p><p>راهنما: از فرمول استاندارد استفاده کنید.</p>'
    );
    return (
      <Box sx={{ maxWidth: 640 }}>
        <RichTextEditor value={value} onChange={setValue} ariaLabel="متن سوال" />
      </Box>
    );
  },
};

export const MinimalPreset: Story = {
  render: function EditorMinimal() {
    const [value, setValue] = useState('<p>گزینه الف</p>');
    return (
      <Stack spacing={1} sx={{ maxWidth: 420 }}>
        <Typography variant="caption" color="text.secondary">
          preset=&quot;minimal&quot; — برای متن گزینه‌ها
        </Typography>
        <RichTextEditor
          value={value}
          onChange={setValue}
          preset="minimal"
          minHeight={80}
          ariaLabel="متن گزینه"
        />
      </Stack>
    );
  },
};

export const InteractionTypeText: Story = {
  tags: ['test'],
  render: function EditorInteraction() {
    const [value, setValue] = useState('');
    return (
      <Box sx={{ maxWidth: 640 }}>
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder="متن را وارد کنید…"
          ariaLabel="ویرایشگر متن"
        />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByLabelText('ویرایشگر متن');
    await userEvent.click(editor);
    await userEvent.type(editor, 'سلام Storybook');
    await waitFor(() => {
      expect(editor).toHaveTextContent('سلام Storybook');
    });
  },
};

export const Mobile: Story = {
  ...WithPersianContent,
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
  },
};
