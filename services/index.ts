/**
 * Service Layer - Centralized API services
 * 
 * This module exports all services and provides a factory function
 * to create service instances with a shared API client.
 */

import { ApiClient } from './api/ApiClient';
import { AuthService } from './auth/AuthService';
import { QuestionService } from './questions/QuestionService';
import { ExamService } from './exams/ExamService';
import { UserService } from './users/UserService';
import { PartnerService } from './partners/PartnerService';
import { GroupService } from './groups/GroupService';
import { MediaService } from './media/MediaService';
import { NotificationService } from './notifications/NotificationService';

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create singleton API client instance
let apiClientInstance: ApiClient | null = null;

/**
 * Get or create API client instance
 */
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(API_BASE_URL);
  }
  return apiClientInstance;
}

/**
 * Create service instances with shared API client
 */
const apiClient = getApiClient();

export const authService = new AuthService(apiClient);
export const questionService = new QuestionService(apiClient);
export const examService = new ExamService(apiClient);
export const userService = new UserService(apiClient);
export const partnerService = new PartnerService(apiClient);
export const groupService = new GroupService(apiClient);
export const mediaService = new MediaService(apiClient);
export const notificationService = new NotificationService(apiClient);

// Export service classes for custom instances if needed
export { AuthService } from './auth/AuthService';
export { QuestionService, type QuestionFilters } from './questions/QuestionService';
export { ExamService } from './exams/ExamService';
export { UserService } from './users/UserService';
export { PartnerService } from './partners/PartnerService';
export { GroupService, type Group, type CreateGroupRequest, type UpdateGroupRequest } from './groups/GroupService';
export { MediaService, type UploadedMedia, type UploadOptions } from './media/MediaService';
export { NotificationService, type Notification, type NotificationsResponse, type ExamNotificationLog } from './notifications/NotificationService';

// Export API client and error types
export { ApiClient, ApiError, type RequestConfig } from './api/ApiClient';

