"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserLayout from "@/components/layout/UserLayout";

/**
 * Single persistent shell (sidebar + bottom nav) for authenticated app routes.
 * Mounted from LayoutContent so navigation does not remount the sidebar.
 */
export default function AuthenticatedShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <UserLayout>{children}</UserLayout>
    </ProtectedRoute>
  );
}
