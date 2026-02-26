/**
 * Check if mock data mode is enabled (NEXT_PUBLIC_USE_MOCK_DATA=true).
 * Used for exam create page defaults and dev indicators.
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const isUsingMockData = (): boolean => USE_MOCK_DATA;
