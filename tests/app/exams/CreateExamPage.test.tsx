import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateExamPage from '@/app/(authenticated)/exams/create/page';
import { useAuth, useCreateExam, useUpdateExam, useCompleteExam, usePartner, useExam } from '@/hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const testTheme = createTheme({ direction: 'rtl' });

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('@/hooks', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useAuth: vi.fn(),
    useIsAuthenticated: vi.fn(() => true),
    usePartner: vi.fn(),
    useExam: vi.fn(),
    useCreateExam: vi.fn(),
    useUpdateExam: vi.fn(),
    useCompleteExam: vi.fn(),
  };
});

async function goToPreviewStep(user: ReturnType<typeof userEvent.setup>) {
  const nextButton = () => screen.getByRole('button', { name: /مرحله بعد/i });
  await user.click(nextButton());
  await user.click(nextButton());
  await user.click(nextButton());
}

vi.mock('@/lib/data-service', () => ({
  isUsingMockData: vi.fn(() => false),
}));

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

describe('CreateExamPage redirects', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush, replace: vi.fn() });
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams());
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, name: 'Creator', roles: ['creator'], permissions: ['create exams'] },
    });
    (usePartner as ReturnType<typeof vi.fn>).mockReturnValue({ data: null, isLoading: false });
    (useExam as ReturnType<typeof vi.fn>).mockReturnValue({ data: null, isLoading: false });
    (useUpdateExam as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    (useCompleteExam as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it('redirects to manage exam (/exams/{id}) when user clicks "Create exam"', async () => {
    const user = userEvent.setup();
    const examId = 42;
    (useCreateExam as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({ id: examId }),
      isPending: false,
    });

    render(<CreateExamPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/عنوان آزمون/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/عنوان آزمون/i);
    await user.type(titleInput, 'Test Exam');
    await goToPreviewStep(user);

    const createExamButton = screen.getByRole('button', { name: /ایجاد آزمون/i });
    await user.click(createExamButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/exams/${examId}`);
    });
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/questions'));
  });

  it('redirects to manage exam questions (/exams/{id}/questions) when user clicks "Create and add question"', async () => {
    const user = userEvent.setup();
    const examId = 42;
    (useCreateExam as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({ id: examId }),
      isPending: false,
    });

    render(<CreateExamPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByLabelText(/عنوان آزمون/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/عنوان آزمون/i);
    await user.type(titleInput, 'Test Exam');
    await goToPreviewStep(user);

    const createAndAddButton = screen.getByRole('button', { name: /ایجاد و افزودن سوال/i });
    await user.click(createAndAddButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/exams/${examId}/questions`);
    });
  });
});
