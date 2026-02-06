import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import UserSidebar from '@/components/layout/UserSidebar';
import { useAuth } from '@/hooks';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

describe('UserSidebar - Role-based Menu Items', () => {
  const mockPush = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    (usePathname as any).mockReturnValue('/dashboard');
  });

  it('shows all menu items for admin', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: 1,
        name: 'Admin',
        roles: ['admin'],
      },
    });

    render(<UserSidebar open={true} onClose={mockClose} />);

    expect(screen.getByText('داشبورد')).toBeInTheDocument();
    expect(screen.getByText('مدیریت آزمون‌ها')).toBeInTheDocument();
    expect(screen.getByText('ایجاد آزمون')).toBeInTheDocument();
    expect(screen.getByText('بانک سوالات')).toBeInTheDocument();
    expect(screen.getByText('پنل مدیریت')).toBeInTheDocument();
  });

  it('shows limited menu items for content_manager (only questions)', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: 1,
        name: 'Content Manager',
        roles: ['content_manager'],
      },
    });

    render(<UserSidebar open={true} onClose={mockClose} />);

    expect(screen.getByText('داشبورد')).toBeInTheDocument();
    expect(screen.getByText('بانک سوالات')).toBeInTheDocument();
    // Content manager should NOT see exam management
    expect(screen.queryByText('مدیریت آزمون‌ها')).not.toBeInTheDocument();
    expect(screen.queryByText('ایجاد آزمون')).not.toBeInTheDocument();
    expect(screen.queryByText('پنل مدیریت')).not.toBeInTheDocument();
  });

  it('shows limited menu items for creator', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: 1,
        name: 'Creator',
        roles: ['creator'],
      },
    });

    render(<UserSidebar open={true} onClose={mockClose} />);

    expect(screen.getByText('داشبورد')).toBeInTheDocument();
    expect(screen.getByText('مدیریت آزمون‌ها')).toBeInTheDocument();
    expect(screen.getByText('ایجاد آزمون')).toBeInTheDocument();
    expect(screen.getByText('بانک سوالات')).toBeInTheDocument();
    // Admin panel should NOT be visible
    expect(screen.queryByText('پنل مدیریت')).not.toBeInTheDocument();
  });

  it('hides admin panel for creator role', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: 1,
        name: 'Creator',
        roles: ['creator'],
      },
    });

    render(<UserSidebar open={true} onClose={mockClose} />);

    const adminPanel = screen.queryByText('پنل مدیریت');
    expect(adminPanel).not.toBeInTheDocument();
  });

  it('shows admin panel for admin role', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: 1,
        name: 'Admin',
        roles: ['admin'],
      },
    });

    render(<UserSidebar open={true} onClose={mockClose} />);

    expect(screen.getByText('پنل مدیریت')).toBeInTheDocument();
  });

  it('does not show admin panel for content_manager role', () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: 1,
        name: 'Content Manager',
        roles: ['content_manager'],
      },
    });

    render(<UserSidebar open={true} onClose={mockClose} />);

    // Content manager should NOT see admin panel
    expect(screen.queryByText('پنل مدیریت')).not.toBeInTheDocument();
  });
});
