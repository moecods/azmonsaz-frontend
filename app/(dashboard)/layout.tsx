"use client";

import UserLayout from '@/components/layout/UserLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}

