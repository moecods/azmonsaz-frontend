"use client";

import { Stack } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import { AdminQuestionCategoriesTab } from '@/components/admin/AdminQuestionCategoriesTab';

export default function AdminQuestionCategoriesPage() {
  return (
    <Stack spacing={3}>
      <Breadcrumb
        items={[
          { label: 'پنل مدیریت', href: '/admin' },
          { label: 'دسته‌بندی سوالات' },
        ]}
      />
      <AdminQuestionCategoriesTab />
    </Stack>
  );
}
