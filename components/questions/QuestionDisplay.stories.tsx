"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stack, Typography, Box } from '@mui/material';
import QuestionDisplay from './QuestionDisplay';
import QuestionView from './QuestionView';
import {
  mockMultipleChoice,
  mockMultipleSelect,
  mockTrueFalse,
  mockEssay,
  mockMatching,
  mockQuestionsByType,
} from '@/components/questions/__storybook__/fixtures';

const meta: Meta<typeof QuestionDisplay> = {
  title: 'سوالات/نمایش — QuestionDisplay & QuestionView',
  component: QuestionDisplay,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'رندر read-only سوال در بانک. `QuestionView` حالت‌های authoring/take/result را پوشش می‌دهد.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuestionDisplay>;

export const MultipleChoice: Story = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <QuestionDisplay source={mockMultipleChoice} />
    </Box>
  ),
};

export const MultipleSelect: Story = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <QuestionDisplay source={mockMultipleSelect} showAnswerKey />
    </Box>
  ),
};

export const AllTypesGallery: Story = {
  render: () => (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      {mockQuestionsByType.map((q) => (
        <Box key={q.id}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {q.type}
          </Typography>
          <QuestionDisplay source={q} compact />
        </Box>
      ))}
    </Stack>
  ),
};

export const TakeMode: Story = {
  render: function TakeModeDemo() {
    const [answer, setAnswer] = useState<string | string[] | null>(null);
    return (
      <Box sx={{ maxWidth: 560 }}>
        <QuestionView
          source={mockTrueFalse}
          mode="take"
          answerValue={answer}
          onAnswerChange={setAnswer}
        />
      </Box>
    );
  },
  parameters: {
    docs: { description: { story: 'حالت شرکت در آزمون — پاسخ‌دهی تعاملی.' } },
  },
};

export const EssayAuthoring: Story = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <QuestionView source={mockEssay} mode="authoring" />
    </Box>
  ),
};

export const MatchingPreview: Story = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <QuestionDisplay source={mockMatching} showAnswerKey />
    </Box>
  ),
};

export const MobileCompact: Story = {
  render: () => (
    <Box sx={{ maxWidth: 360 }}>
      <QuestionDisplay source={mockMultipleChoice} compact />
    </Box>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
  },
};
