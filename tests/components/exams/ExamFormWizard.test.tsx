import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { examSchema, ExamFormData } from '@/lib/validation';
import { ExamFormWizard } from '@/components/exams/ExamFormWizard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const testTheme = createTheme({ direction: 'rtl' });

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  };
}

const validDefaultValues: ExamFormData = {
  title: 'Test Exam',
  type: 'online',
  questions: [],
  duration_minutes: null,
  passing_score: null,
  grading_mode: 'numeric_percent',
  instructions: '',
  tags: [],
  schedule_type: 'none',
  exam_date: null,
  start_time: null,
  end_time: null,
  result_release_after_exam_end: true,
  result_release_after_grading_complete: true,
  result_release_requires_manual: false,
};

async function goToPreviewStep(user: ReturnType<typeof userEvent.setup>) {
  const nextButton = () => screen.getByRole('button', { name: /مرحله بعد/i });
  await user.click(nextButton());
  await user.click(nextButton());
  await user.click(nextButton());
}

function TestWizard({
  onSubmit,
  existingExam = false,
}: {
  onSubmit: (data: ExamFormData, redirectToQuestions: boolean) => void;
  existingExam?: boolean;
}) {
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: validDefaultValues,
  });
  return (
    <ExamFormWizard
      form={form}
      onSubmit={onSubmit}
      isSubmitting={false}
      existingExam={existingExam}
    />
  );
}

describe('ExamFormWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onSubmit with redirectToQuestions false when "Create exam" button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestWizard onSubmit={onSubmit} />,
      { wrapper: createWrapper() }
    );

    await goToPreviewStep(user);

    const createExamButton = screen.getByRole('button', { name: /ایجاد آزمون/i });
    await user.click(createExamButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Exam' }),
      false
    );
  });

  it('calls onSubmit with redirectToQuestions true when "Create and add question" button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestWizard onSubmit={onSubmit} />,
      { wrapper: createWrapper() }
    );

    await goToPreviewStep(user);

    const createAndAddButton = screen.getByRole('button', { name: /ایجاد و افزودن سوال/i });
    await user.click(createAndAddButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Exam' }),
      true
    );
  });

  it('shows save button when existingExam is true on preview step', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestWizard onSubmit={onSubmit} existingExam />,
      { wrapper: createWrapper() }
    );

    await goToPreviewStep(user);

    expect(screen.getByRole('button', { name: /ذخیره تغییرات/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ایجاد آزمون/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ایجاد و افزودن سوال/i })).not.toBeInTheDocument();
  });
});
