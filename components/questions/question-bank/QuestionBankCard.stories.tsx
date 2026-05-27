"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Chip, IconButton, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { QuestionBankCard } from './QuestionBankCard';
import { QuestionTypeChip } from '@/components/questions/QuestionTypeChip';
import QuestionDisplay from '@/components/questions/QuestionDisplay';
import { mockMultipleChoice } from '@/components/questions/__storybook__/fixtures';

const meta: Meta<typeof QuestionBankCard> = {
  title: 'سوالات/بانک — QuestionBankCard',
  component: QuestionBankCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'قاب کارت سوال در بانک — حاشیه رنگی بر اساس نوع سوال.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuestionBankCard>;

const sampleMeta = (
  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
    <QuestionTypeChip type="multiple_choice" />
    <Chip label="آسان" size="small" color="success" />
    <Chip label="ریاضیات" size="small" variant="outlined" />
  </Stack>
);

export const Default: Story = {
  tags: ['visual'],
  render: () => (
    <QuestionBankCard
      questionType="multiple_choice"
      meta={sampleMeta}
      actions={
        <>
          <IconButton size="small" aria-label="ویرایش">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="حذف" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      <QuestionDisplay source={mockMultipleChoice} compact />
    </QuestionBankCard>
  ),
};

export const Selected: Story = {
  render: () => (
    <QuestionBankCard questionType="multiple_choice" meta={sampleMeta} selected>
      <QuestionDisplay source={mockMultipleChoice} compact />
    </QuestionBankCard>
  ),
};

export const Muted: Story = {
  render: () => (
    <QuestionBankCard questionType="multiple_choice" meta={sampleMeta} muted>
      <QuestionDisplay source={mockMultipleChoice} compact />
    </QuestionBankCard>
  ),
};

export const Mobile: Story = {
  ...Default,
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
    docs: { description: { story: 'نمایش کارت در viewport موبایل.' } },
  },
};
