"use client";

import { Stack } from "@mui/material";
import { useAuth } from "@/hooks";
import Breadcrumb from "@/components/Breadcrumb";
import StudentDashboard from "@/components/dashboard/student/StudentDashboard";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes("admin");
  const isCreator =
    isAdmin ||
    user?.roles?.includes("content_manager") ||
    user?.roles?.includes("creator");

  return (
    <Stack spacing={2}>
      <Breadcrumb items={[{ label: "داشبورد" }]} />
      {isAdmin ? (
        <AdminDashboard userName={user?.name} />
      ) : isCreator ? (
        <CreatorDashboard userName={user?.name} />
      ) : (
        <StudentDashboard userName={user?.name} />
      )}
    </Stack>
  );
}
