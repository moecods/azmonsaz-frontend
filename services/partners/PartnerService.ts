/**
 * Partner Service
 * Handles all partner-related API calls (Admin only)
 */

import { ApiClient } from '../api/ApiClient';
import { Partner, ApiResponse, PaginatedResponse } from '@/types';

export interface PartnerFilters {
  page?: number;
  per_page?: number;
}

export interface CreatePartnerData {
  name: string;
  website_url?: string | null;
  callback_url: string;
}

export interface UpdatePartnerData {
  name?: string;
  website_url?: string | null;
  callback_url?: string;
}

export class PartnerService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get partners with pagination
   */
  async getPartners(
    filters?: PartnerFilters
  ): Promise<ApiResponse<PaginatedResponse<Partner>>> {
    // Backend returns: { success: true, data: [...], meta: {...} }
    // ApiClient.get returns the full response object
    const response = await this.apiClient.get<any>('/partners', filters);

    // Transform to match PaginatedResponse structure
    // response.data is the array of partners
    // response.meta is at root level (from backend)
    return {
      success: response.success ?? true,
      data: {
        data: Array.isArray(response.data) ? response.data : [],
        meta: response.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: Array.isArray(response.data) ? response.data.length : 0,
        },
      },
    };
  }

  /**
   * Get single partner by ID
   */
  async getPartner(id: number): Promise<ApiResponse<Partner>> {
    return this.apiClient.get<Partner>(`/partners/${id}`);
  }

  /**
   * Create new partner
   */
  async createPartner(
    data: CreatePartnerData
  ): Promise<ApiResponse<Partner>> {
    return this.apiClient.post<Partner>('/partners', data);
  }

  /**
   * Update partner
   */
  async updatePartner(
    id: number,
    data: UpdatePartnerData
  ): Promise<ApiResponse<Partner>> {
    return this.apiClient.patch<Partner>(`/partners/${id}`, data);
  }

  /**
   * Toggle partner active status
   */
  async toggleActive(id: number): Promise<ApiResponse<Partner>> {
    return this.apiClient.post<Partner>(`/partners/${id}/toggle-active`);
  }

  /**
   * Get partner statistics/reports
   */
  async getPartnerStatistics(
    partnerId: number
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.apiClient.get(`/partners/${partnerId}/reports/summary`);
  }

  /**
   * Get partner exam statistics
   */
  async getPartnerExamStats(
    partnerId: number
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.apiClient.get(`/partners/${partnerId}/reports/exams`);
  }

  /**
   * Get specific exam report for partner
   */
  async getPartnerExamReport(
    partnerId: number,
    examId: number
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.apiClient.get(
      `/partners/${partnerId}/reports/exams/${examId}`
    );
  }
}

