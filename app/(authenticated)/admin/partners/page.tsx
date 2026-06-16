"use client";

import { Stack } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import { AdminPartnersTab } from '@/components/admin/AdminPartnersTab';

export default function AdminPartnersPage() {
  return (
    <Stack spacing={3}>
      <Breadcrumb
        items={[
          { label: 'پنل مدیریت', href: '/admin' },
          { label: 'شرکا' },
        ]}
      />
      <AdminPartnersTab />
    </Stack>
  );
}
