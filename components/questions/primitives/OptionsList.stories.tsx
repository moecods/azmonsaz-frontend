"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stack, Typography, Box } from '@mui/material';
import OptionsList from './OptionsList';
import { mockMultipleChoice, mockMultipleSelect } from '@/components/questions/__storybook__/fixtures';

const meta: Meta<typeof OptionsList> = {
  title: 'سوالات/اولیه — OptionsList',
  component: OptionsList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'لیست گزینه‌ها با برچسب الفبایی و هایلایت پاسخ صحیح (authoring).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OptionsList>;

export const AuthoringWithKey: Story = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <OptionsList
        questionType="multiple_choice"
        options={mockMultipleChoice.options ?? []}
        correctAnswer={mockMultipleChoice.correct_answer}
        mode="authoring"
      />
    </Box>
  ),
};

export const Readonly: Story = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <OptionsList
        questionType="multiple_choice"
        options={mockMultipleChoice.options ?? []}
        correctAnswer={mockMultipleChoice.correct_answer}
        mode="readonly"
      />
    </Box>
  ),
};

export const MultipleSelect: Story = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <OptionsList
        questionType="multiple_select"
        options={mockMultipleSelect.options ?? []}
        correctAnswer={mockMultipleSelect.correct_answer}
        mode="authoring"
      />
    </Box>
  ),
};

export const TwoPerRow: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 520 }}>
      <Typography variant="caption" color="text.secondary">
        optionsPerRow = 2
      </Typography>
      <OptionsList
        questionType="multiple_choice"
        options={mockMultipleChoice.options ?? []}
        correctAnswer={mockMultipleChoice.correct_answer}
        displaySettings={{ optionsPerRow: 2, optionLabelStyle: 'alphabetic' }}
      />
    </Stack>
  ),
};
