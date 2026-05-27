"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, Stack, Typography } from '@mui/material';
import { buildExtensions } from './extensions';
import { EditorToolbar } from './toolbar/EditorToolbar';

function ToolbarDemo({ preset }: { preset: 'full' | 'minimal' }) {
  const editor = useEditor({
    extensions: buildExtensions({ preset }),
    content: '<p>نمونه متن برای تست نوار ابزار</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <Stack spacing={1} sx={{ maxWidth: preset === 'full' ? 720 : 420 }}>
      <Typography variant="caption" color="text.secondary">
        preset=&quot;{preset}&quot;
      </Typography>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <EditorToolbar editor={editor} preset={preset} />
        <Box sx={{ p: 2, minHeight: 80 }}>
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Stack>
  );
}

const meta: Meta = {
  title: 'ویرایشگر/نوار ابزار — EditorToolbar',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'نوار ابزار TipTap — نیاز به نمونه Editor دارد. برای preset کامل و minimal جدا story داریم.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const FullPreset: StoryObj = {
  render: () => <ToolbarDemo preset="full" />,
};

export const MinimalPreset: StoryObj = {
  render: () => <ToolbarDemo preset="minimal" />,
};
