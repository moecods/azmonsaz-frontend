"use client";

import { Stack } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';

export default function AdminUsersPage() {
  return (
    <Stack spacing={3}>
      <Breadcrumb
        items={[
          { label: 'پنل مدیریت', href: '/admin' },
          { label: 'کاربران' },
        ]}
      />
      <AdminUsersTab />
    </Stack>
  );
}
