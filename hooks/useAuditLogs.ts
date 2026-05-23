import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditLogService } from "@/services";

export function useAuditLogs(params?: {
  per_page?: number;
  page?: number;
  event?: string;
  subject_type?: string;
  subject_id?: number;
}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const response = await auditLogService.getAuditLogs(params);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch audit logs");
      }
      return response.data;
    },
    enabled: params !== undefined,
  });
}
