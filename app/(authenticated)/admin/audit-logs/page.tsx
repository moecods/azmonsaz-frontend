"use client";

import { Stack } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import { AdminAuditLogsTab } from '@/components/admin/AdminAuditLogsTab';

export default function AdminAuditLogsPage() {
  return (
    <Stack spacing={3}>
      <Breadcrumb
        items={[
          { label: 'پنل مدیریت', href: '/admin' },
          { label: 'لاگ‌ها' },
        ]}
      />
      <AdminAuditLogsTab />
    </Stack>
  );
}
