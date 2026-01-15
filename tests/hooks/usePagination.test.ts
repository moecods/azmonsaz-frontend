import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }));

    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(10);
    expect(result.current.total).toBe(100);
    expect(result.current.totalPages).toBe(10);
  });

  it('should calculate total pages correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 95, perPage: 10 })
    );

    expect(result.current.totalPages).toBe(10);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }));

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.page).toBe(5);
  });

  it('should not go to invalid page', () => {
    const { result } = renderHook(() => usePagination({ total: 100, perPage: 10 }));

    act(() => {
      result.current.goToPage(0);
    });
    expect(result.current.page).toBe(1);

    act(() => {
      result.current.goToPage(11);
    });
    expect(result.current.page).toBe(1);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }));

    act(() => {
      result.current.goToPage(5);
      result.current.prevPage();
    });

    expect(result.current.page).toBe(4);
  });

  it('should not go before first page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1);
  });

  it('should not go after last page', () => {
    const { result } = renderHook(() => usePagination({ total: 100, perPage: 10 }));

    act(() => {
      result.current.goToPage(10);
      result.current.nextPage();
    });

    expect(result.current.page).toBe(10);
  });

  it('should calculate start and end index correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, perPage: 10 })
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.startIndex).toBe(20);
    expect(result.current.endIndex).toBe(30);
  });

  it('should have correct hasNextPage and hasPrevPage flags', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, perPage: 10 })
    );

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => {
      result.current.goToPage(10);
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(true);
  });
});

