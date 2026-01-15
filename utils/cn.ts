import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge class names
 * Combines clsx and tailwind-merge functionality
 * 
 * @example
 * ```tsx
 * cn('foo', 'bar', { 'baz': true }) // 'foo bar baz'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

