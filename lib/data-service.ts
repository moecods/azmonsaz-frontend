// Data service layer that switches between mock and real API
import { apiClient } from './api';
import { mockApiClient } from './mock-data';

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Export the appropriate client based on environment
export const dataService = USE_MOCK_DATA ? mockApiClient : apiClient;

// Helper function to check if we're using mock data
export const isUsingMockData = () => USE_MOCK_DATA;

// Log which data source is being used
if (typeof window !== 'undefined') {
  console.log(`�� Data Source: ${USE_MOCK_DATA ? 'Mock Data' : 'Real API'}`);
}
