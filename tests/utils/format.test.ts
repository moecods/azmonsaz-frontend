import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime, formatNumber, formatPhone, formatCurrency } from '@/utils/format';

describe('format utilities', () => {
  describe('formatDate', () => {
    it('should format a valid date', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should return "-" for null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toBeTruthy();
    });

    it('should return "-" for invalid date', () => {
      expect(formatDate(new Date('invalid'))).toBe('-');
    });
  });

  describe('formatTime', () => {
    it('should format a valid time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should return "-" for null', () => {
      expect(formatTime(null)).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatNumber', () => {
    it('should format a number', () => {
      expect(formatNumber(1234567)).toBeTruthy();
      expect(typeof formatNumber(1234567)).toBe('string');
    });

    it('should return "-" for null', () => {
      expect(formatNumber(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatNumber(undefined)).toBe('-');
    });
  });

  describe('formatPhone', () => {
    it('should format a valid phone number', () => {
      expect(formatPhone('09123456789')).toBe('0912 345 6789');
    });

    it('should handle phone with non-digits and country code', () => {
      // +98-912-345-6789 -> 989123456789 -> 9123456789 -> 09123456789 -> 0912 345 6789
      expect(formatPhone('+98-912-345-6789')).toBe('0912 345 6789');
    });

    it('should return "-" for null', () => {
      expect(formatPhone(null)).toBe('-');
    });

    it('should return original if not 11 digits', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency', () => {
      const formatted = formatCurrency(1234567);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should return "-" for null', () => {
      expect(formatCurrency(null)).toBe('-');
    });
  });
});

