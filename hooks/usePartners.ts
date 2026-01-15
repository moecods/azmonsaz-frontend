/**
 * Custom hook for managing partners (Admin only)
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService, ApiError } from '@/services';
import { Partner, PartnerFilters, CreatePartnerData, UpdatePartnerData } from '@/services/partners';
import { queryKeys } from '@/lib/query-client';

export function usePartners(filters?: PartnerFilters) {
  return useQuery({
    queryKey: queryKeys.partners(filters),
    queryFn: async () => {
      const response = await partnerService.getPartners(filters);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch partners');
      }
      return response.data;
    },
  });
}

export function usePartner(id: number | null) {
  return useQuery({
    queryKey: queryKeys.partner(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await partnerService.getPartner(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch partner');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePartnerData) => {
      const response = await partnerService.createPartner(data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to create partner',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate partners list
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePartnerData }) => {
      const response = await partnerService.updatePartner(id, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update partner',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update partner in cache
      queryClient.setQueryData(queryKeys.partner(variables.id), data);
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useTogglePartnerActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await partnerService.toggleActive(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to toggle partner active status');
      }
      return response.data;
    },
    onSuccess: (data, id) => {
      // Update partner in cache
      queryClient.setQueryData(queryKeys.partner(id), data);
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function usePartnerStatistics(partnerId: number | null) {
  return useQuery({
    queryKey: ['partner', partnerId, 'statistics'],
    queryFn: async () => {
      if (!partnerId) return null;
      const response = await partnerService.getPartnerStatistics(partnerId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch partner statistics');
      }
      return response.data;
    },
    enabled: !!partnerId,
  });
}

export function usePartnerExamStats(partnerId: number | null) {
  return useQuery({
    queryKey: ['partner', partnerId, 'exam-stats'],
    queryFn: async () => {
      if (!partnerId) return null;
      const response = await partnerService.getPartnerExamStats(partnerId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch partner exam stats');
      }
      return response.data;
    },
    enabled: !!partnerId,
  });
}

export function usePartnerExamReport(partnerId: number | null, examId: number | null) {
  return useQuery({
    queryKey: ['partner', partnerId, 'exam-report', examId],
    queryFn: async () => {
      if (!partnerId || !examId) return null;
      const response = await partnerService.getPartnerExamReport(partnerId, examId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch exam report');
      }
      return response.data;
    },
    enabled: !!partnerId && !!examId,
  });
}

