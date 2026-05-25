import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GuestRoute from '@/components/GuestRoute';
import { useIsAuthenticated } from '@/hooks';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useIsAuthenticated: vi.fn(),
}));

describe('GuestRoute', () => {
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      replace: mockReplace,
    });
  });

  it('renders children when user is not authenticated', async () => {
    (useIsAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(
      <GuestRoute>
        <div>Login Form</div>
      </GuestRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to dashboard when user is authenticated', async () => {
    (useIsAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <GuestRoute>
        <div>Login Form</div>
      </GuestRoute>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
    expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
  });

  it('redirects to custom path when redirectTo is set', async () => {
    (useIsAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(
      <GuestRoute redirectTo="/dashboard">
        <div>Register Form</div>
      </GuestRoute>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });
});
