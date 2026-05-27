"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Box } from '@mui/material';
import { ExamFormWizard } from './ExamFormWizard';
import { examSchema, type ExamFormData } from '@/lib/validation';

const defaultValues: ExamFormData = {
  title: 'آزمون نمونه Storybook',
  type: 'online',
  questions: [],
  duration_minutes: 90,
  passing_score: 50,
  instructions: '<p>قوانین آزمون را مطالعه کنید.</p>',
  tags: ['نمونه'],
  schedule_type: 'fixed_window',
  exam_date: '2026-06-15',
  start_time: '08:30',
  end_time: '10:30',
  grading_mode: 'numeric_percent',
  result_release_after_exam_end: true,
  result_release_after_grading_complete: true,
  result_release_requires_manual: false,
};

function WizardShell({
  existingExam = false,
  onSubmit = fn(),
}: {
  existingExam?: boolean;
  onSubmit?: (data: ExamFormData, redirectToQuestions: boolean) => void;
}) {
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues,
  });

  return (
    <ExamFormWizard
      form={form}
      onSubmit={onSubmit}
      isSubmitting={false}
      existingExam={existingExam}
      showCreatorSelect={false}
    />
  );
}

const meta: Meta<typeof ExamFormWizard> = {
  title: 'آزمون/ویزارد — ExamFormWizard',
  component: ExamFormWizard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ویزارد چندمرحله‌ای ساخت/ویرایش آزمون. `showCreatorSelect={false}` برای story بدون API.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamFormWizard>;

export const CreateFlow: Story = {
  render: () => (
    <Box sx={{ maxWidth: 900 }}>
      <WizardShell />
    </Box>
  ),
};

export const EditExisting: Story = {
  render: () => (
    <Box sx={{ maxWidth: 900 }}>
      <WizardShell existingExam />
    </Box>
  ),
};

export const InteractionNextStep: Story = {
  tags: ['test'],
  render: () => (
    <Box sx={{ maxWidth: 900 }}>
      <WizardShell />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextBtn = canvas.getByRole('button', { name: /مرحله بعد/i });
    await userEvent.click(nextBtn);
    // عنوان مرحله در محتوا (h6) — در sidebar هم همان متن در <p> هست
    await expect(
      canvas.getByRole('heading', { name: /تنظیمات و نمره‌دهی/i })
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  render: () => (
    <Box sx={{ maxWidth: 900 }}>
      <WizardShell />
    </Box>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
  },
};
