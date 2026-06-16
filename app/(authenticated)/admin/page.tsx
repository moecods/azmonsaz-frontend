"use client";

import { Box, Stack, Typography } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';

export default function AdminOverviewPage() {
  return (
    <Stack spacing={3}>
      <Breadcrumb items={[{ label: 'پنل مدیریت' }]} />
      <Box>
        <Typography variant="h4" fontWeight={800}>
          پنل مدیریت
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          از منوی کناری (دسکتاپ) یا دکمه‌های بالای صفحه (موبایل) بخش مورد نظر را انتخاب کنید.
        </Typography>
      </Box>
    </Stack>
  );
}
