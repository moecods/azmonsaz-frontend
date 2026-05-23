"use client";

import { Stack } from "@mui/material";
import { useAuth } from "@/hooks";
import Breadcrumb from "@/components/Breadcrumb";
import StudentDashboard from "@/components/dashboard/student/StudentDashboard";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  const isCreator =
    user?.roles?.includes("admin") ||
    user?.roles?.includes("content_manager") ||
    user?.roles?.includes("creator");

  return (
    <Stack spacing={2}>
      <Breadcrumb items={[{ label: "داشبورد" }]} />
      {isCreator ? (
        <CreatorDashboard userName={user?.name} />
      ) : (
        <StudentDashboard userName={user?.name} />
      )}
    </Stack>
  );
}
