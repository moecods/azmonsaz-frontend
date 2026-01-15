import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog } from '@/hooks/useDialog';

describe('useDialog', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.open).toBe(false);
  });

  it('should initialize with custom open state', () => {
    const { result } = renderHook(() => useDialog(true));
    expect(result.current.open).toBe(true);
  });

  it('should open dialog', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.open).toBe(true);
  });

  it('should close dialog', () => {
    const { result } = renderHook(() => useDialog(true));

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.open).toBe(false);
  });

  it('should toggle dialog', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.toggleDialog();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.toggleDialog();
    });
    expect(result.current.open).toBe(false);
  });
});

