import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  it('renders children when user is authenticated and has required role', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Test User',
        roles: ['admin'],
      },
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects to login when user is not authenticated', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('shows 403 error when user does not have required role', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Test User',
        roles: ['creator'],
      },
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/دسترسی محدود شده است/i)).toBeInTheDocument();
      expect(screen.getByText(/شما دسترسی به این صفحه را ندارید/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during initial load', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading spinner
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access when no role is required', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Test User',
        roles: ['creator'],
      },
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('allows admin to access admin routes', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Admin User',
        roles: ['admin'],
      },
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('allows content_manager to access content_manager routes', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Content Manager',
        roles: ['content_manager'],
      },
    });

    render(
      <ProtectedRoute requiredRole="content_manager">
        <div>Content Manager Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Manager Content')).toBeInTheDocument();
    });
  });

  it('allows creator to access creator routes', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Creator',
        roles: ['creator'],
      },
    });

    render(
      <ProtectedRoute requiredRole="creator">
        <div>Creator Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Creator Content')).toBeInTheDocument();
    });
  });

  it('denies creator access to admin routes', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Creator',
        roles: ['creator'],
      },
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/دسترسی محدود شده است/i)).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
    
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('denies content_manager access to admin-only routes', async () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        name: 'Content Manager',
        roles: ['content_manager'],
      },
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText(/دسترسی محدود شده است/i)).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
    
    expect(mockPush).not.toHaveBeenCalled();
  });
});
