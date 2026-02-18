/** Default timezone for date/time display (Iran) */
export const DEFAULT_TIMEZONE = 'Asia/Tehran';

/**
 * Format date to Persian/Farsi format
 * @param date - Date object or string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fa-IR', { timeZone: DEFAULT_TIMEZONE, ...options }).format(dateObj);
}

/**
 * Format time
 * @param date - Date object or string
 * @returns Formatted time string (HH:MM)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TIMEZONE,
  }).format(dateObj);
}

/**
 * Format date and time
 * @param date - Date object or string
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TIMEZONE,
  }).format(dateObj);
}

/**
 * Format number to Persian/Farsi format
 * @param number - Number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
  number: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (number === null || number === undefined) return '-';
  
  return new Intl.NumberFormat('fa-IR', options).format(number);
}

/**
 * Format phone number
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., 0912 345 6789)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If starts with country code (98), remove it
  // +98-912-345-6789 -> 989123456789 (12 digits) -> 9123456789 (10 digits)
  if (digits.startsWith('98') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  
  // If 10 digits (without leading 0), add 0
  // 9123456789 -> 09123456789
  if (digits.length === 10) {
    digits = '0' + digits;
  }
  
  // Format: 0912 345 6789 (11 digits)
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  
  // If not 11 digits, return original (might be formatted already or invalid)
  return phone;
}

/**
 * Format currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'IRR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'IRR'
): string {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

