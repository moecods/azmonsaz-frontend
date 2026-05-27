"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box } from '@mui/material';
import { ParticipantAttachedGroupsStrip } from './ParticipantAttachedGroupsStrip';

const meta: Meta<typeof ParticipantAttachedGroupsStrip> = {
  title: 'آزمون/شرکت‌کنندگان — گروه‌های متصل',
  component: ParticipantAttachedGroupsStrip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ParticipantAttachedGroupsStrip>;

export const Default: Story = {
  render: () => (
    <Box sx={{ maxWidth: 640 }}>
      <ParticipantAttachedGroupsStrip
        groups={[
          { id: 1, name: 'کلاس دهم', users_count: 32 },
          { id: 2, name: 'کلاس یازدهم', users_count: 28, description: 'فیزیک' },
        ]}
      />
    </Box>
  ),
};
