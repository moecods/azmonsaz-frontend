"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPermission="manage users">
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
