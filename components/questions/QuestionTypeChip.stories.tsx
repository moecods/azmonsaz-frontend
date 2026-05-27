"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Stack } from '@mui/material';
import { QuestionTypeChip } from './QuestionTypeChip';
import { QUESTION_TYPE_IDS } from '@/lib/question-types';

const meta: Meta<typeof QuestionTypeChip> = {
  title: 'سوالات/نوع — QuestionTypeChip',
  component: QuestionTypeChip,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Chip رنگی برای نوع سوال — در کارت بانک و لیست استفاده می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuestionTypeChip>;

export const MultipleChoice: Story = {
  args: { type: 'multiple_choice' },
};

export const AllTypes: Story = {
  render: () => (
    <Stack direction="row" flexWrap="wrap" gap={0.75}>
      {QUESTION_TYPE_IDS.map((type) => (
        <QuestionTypeChip key={type} type={type} />
      ))}
    </Stack>
  ),
};

export const CustomLabel: Story = {
  args: { type: 'essay', label: 'سؤال تشریحی' },
};

export const InteractionClick: Story = {
  tags: ['test'],
  render: () => {
    const handleClick = () => undefined;
    return (
      <QuestionTypeChip
        type="multiple_choice"
        clickable
        onClick={handleClick}
        aria-label="نوع سوال: چندگزینه‌ای"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: /نوع سوال: چندگزینه/i });
    await userEvent.click(chip);
    await expect(chip).toBeVisible();
  },
};
