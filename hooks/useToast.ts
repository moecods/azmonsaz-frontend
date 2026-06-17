"use client";

import { useToastContext } from "@/providers/ToastProvider";

/** Global toast notifications — requires ToastProvider in app layout. */
export function useToast() {
  return useToastContext();
}
