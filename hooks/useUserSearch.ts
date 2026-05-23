"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services";

export function useUserSearch(query: string, minLength = 3) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= minLength;

  return useQuery({
    queryKey: ["users", "search", trimmed],
    queryFn: async () => {
      const response = await userService.searchUsers({ query: trimmed, type: "both" });
      if (!response.success) {
        throw new Error(response.message || "Failed to search users");
      }
      return { data: response.data || [] };
    },
    enabled,
  });
}
