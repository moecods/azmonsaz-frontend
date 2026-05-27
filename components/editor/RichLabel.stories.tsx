"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stack, Typography, Box } from '@mui/material';
import { RichLabel, RichTextRenderer } from '@/components/editor';
import { mockRichHtml } from '@/components/questions/__storybook__/fixtures';

const meta: Meta<typeof RichLabel> = {
  title: 'ویرایشگر/خواندن — RichLabel & RichTextRenderer',
  component: RichLabel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'RichLabel متن ساده یا HTML را تشخیص می‌دهد. RichTextRenderer HTML را sanitize و math را رندر می‌کند.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RichLabel>;

export const PlainText: Story = {
  render: () => <RichLabel html={mockRichHtml.plain} />,
};

export const FormattedHtml: Story = {
  render: () => (
    <Box sx={{ maxWidth: 520 }}>
      <RichTextRenderer html={mockRichHtml.formatted} />
    </Box>
  ),
};

export const RichLabelAutoDetect: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 520 }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          plain
        </Typography>
        <RichLabel html={mockRichHtml.plain} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          HTML
        </Typography>
        <RichLabel html={mockRichHtml.formatted} block />
      </Box>
    </Stack>
  ),
};

export const CodeBlock: Story = {
  render: () => (
    <Box sx={{ maxWidth: 520 }}>
      <RichTextRenderer html={mockRichHtml.code} />
    </Box>
  ),
};
