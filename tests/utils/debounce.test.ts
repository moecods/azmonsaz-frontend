import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from '@/utils/debounce';

describe('debounce and throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 300);

      debouncedFunc('test');
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 300);

      debouncedFunc('test1');
      debouncedFunc('test2');
      debouncedFunc('test3');

      vi.advanceTimersByTime(300);
      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith('test3');
    });

    it('should handle multiple rapid calls', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 300);

      debouncedFunc('test1');
      vi.advanceTimersByTime(100);
      debouncedFunc('test2');
      vi.advanceTimersByTime(100);
      debouncedFunc('test3');
      vi.advanceTimersByTime(300);

      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith('test3');
    });
  });

  describe('throttle', () => {
    it('should limit function execution', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 300);

      throttledFunc('test1');
      expect(func).toHaveBeenCalledTimes(1);

      throttledFunc('test2');
      expect(func).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(300);
      throttledFunc('test3');
      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should execute immediately on first call', () => {
      const func = vi.fn();
      const throttledFunc = throttle(func, 300);

      throttledFunc('test');
      expect(func).toHaveBeenCalledTimes(1);
      expect(func).toHaveBeenCalledWith('test');
    });
  });
});

