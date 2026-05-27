"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Box } from '@mui/material';
import { ParticipantAddMethodNav } from './ParticipantAddMethodNav';
import type { ParticipantAddMethod } from './participant-ui-shared';

const meta: Meta<typeof ParticipantAddMethodNav> = {
  title: 'آزمون/شرکت‌کنندگان — روش افزودن',
  component: ParticipantAddMethodNav,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ناوبری عمودی/افقی برای انتخاب روش افزودن شرکت‌کننده.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ParticipantAddMethodNav>;

export const Default: Story = {
  render: function NavDemo() {
    const [value, setValue] = useState<ParticipantAddMethod>('groups');
    return (
      <Box sx={{ maxWidth: 200 }}>
        <ParticipantAddMethodNav value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const SearchSelected: Story = {
  render: function SearchNav() {
    const [value, setValue] = useState<ParticipantAddMethod>('search');
    return (
      <Box sx={{ maxWidth: 200 }}>
        <ParticipantAddMethodNav value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const InteractionSwitchMethod: Story = {
  tags: ['test'],
  render: function NavInteraction() {
    const [value, setValue] = useState<ParticipantAddMethod>('groups');
    return (
      <Box sx={{ maxWidth: 240 }}>
        <ParticipantAddMethodNav value={value} onChange={setValue} />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchBtn = canvas.getByRole('button', { name: /جستجو/i });
    await userEvent.click(searchBtn);
    await expect(searchBtn).toHaveAttribute('aria-pressed', 'true');
  },
};
