"use client";

import { Stack } from "@mui/material";
import Breadcrumb from "@/components/Breadcrumb";
import NotificationsPageContent from "@/components/notifications/NotificationsPageContent";

export default function NotificationsPage() {
  return (
    <Stack spacing={2}>
      <Breadcrumb items={[{ label: "اعلان‌ها" }]} />
      <NotificationsPageContent />
    </Stack>
  );
}
