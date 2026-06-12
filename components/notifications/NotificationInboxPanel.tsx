"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useAuth } from "@/hooks";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { hasPermission } from "@/lib/permissions";
import { EmptyState } from "@/components/feedback/PageStates";
import ShellContentLoader from "@/components/layout/ShellContentLoader";
import { ContentPanel } from "@/components/exams/participants/participant-ui-shared";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import type { NotificationFilter } from "@/lib/notification-display";
import { groupNotificationsByDate, notificationHref } from "@/lib/notification-display";
import type { Notification } from "@/services/notifications/NotificationService";

const PER_PAGE = 20;

const FILTER_OPTIONS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "unread", label: "خوانده‌نشده" },
];

export function NotificationInboxPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const canManageExams = hasPermission(user?.permissions, "view exams");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const { data, isLoading, isFetching, error, refetch } = useNotifications({
    page,
    per_page: PER_PAGE,
    unread_only: filter === "unread",
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.data ?? [];
  const meta = data?.meta;
  const grouped = useMemo(() => groupNotificationsByDate(notifications), [notifications]);
  const hasUnread = notifications.some((n) => !n.read_at);

  const handleMarkRead = useCallback(
    (id: string) => {
      markAsRead.mutate(id);
    },
    [markAsRead]
  );

  const handlePress = useCallback(
    (item: Notification) => {
      if (!item.read_at) {
        markAsRead.mutate(item.id);
      }
      const href = notificationHref(item, { canManageExams });
      if (href) router.push(href);
    },
    [markAsRead, router, canManageExams]
  );

  if (error) {
    return (
      <EmptyState
        title="خطا در بارگذاری اعلان‌ها"
        message={error instanceof Error ? error.message : "لطفاً دوباره تلاش کنید."}
        action={
          <Button variant="contained" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        }
      />
    );
  }

  return (
    <ShellContentLoader loading={isLoading} fetching={!isLoading && isFetching}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {FILTER_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                clickable
                color={filter === opt.value ? "primary" : "default"}
                variant={filter === opt.value ? "filled" : "outlined"}
                onClick={() => {
                  setFilter(opt.value);
                  setPage(1);
                }}
                sx={{ fontWeight: filter === opt.value ? 700 : 500 }}
              />
            ))}
          </Stack>

          {hasUnread && (
            <Button
              variant="text"
              size="small"
              startIcon={<MarkEmailReadIcon />}
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" }, whiteSpace: "nowrap" }}
            >
              خواندن همه
            </Button>
          )}
        </Stack>

        {notifications.length === 0 ? (
          <ContentPanel>
            <EmptyState
              title={filter === "unread" ? "اعلان خوانده‌نشده‌ای ندارید" : "اعلانی وجود ندارد"}
              message={
                filter === "unread"
                  ? "همه پیام‌ها را خوانده‌اید."
                  : "وقتی اعلان جدیدی دریافت کنید، اینجا نمایش داده می‌شود."
              }
            />
          </ContentPanel>
        ) : (
          <ContentPanel noPadding>
            {grouped.map((section, sectionIndex) => (
              <Box key={section.key}>
                {sectionIndex > 0 && <Divider />}
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ display: "block", px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 0.5 }}
                >
                  {section.label}
                </Typography>
                {section.items.map((item, index) => (
                  <Box key={item.id}>
                    {index > 0 && <Divider sx={{ mx: { xs: 1.5, sm: 2 } }} />}
                    <NotificationRow
                      item={item}
                      canManageExams={canManageExams}
                      autoMarkRead
                      onMarkRead={handleMarkRead}
                      onPress={handlePress}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </ContentPanel>
        )}

        {meta && meta.last_page > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={meta.last_page}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="small"
              shape="rounded"
            />
          </Box>
        )}
      </Stack>
    </ShellContentLoader>
  );
}

export function useNotificationStats() {
  const { data, isLoading } = useNotifications({ per_page: 1, unread_only: true });

  return useMemo(() => {
    const unread = data?.meta?.total ?? 0;
    return { unread, isLoading };
  }, [data, isLoading]);
}

export function NotificationStatsChips({ unread }: { unread: number }) {
  if (unread <= 0) {
    return (
      <Chip label="همه خوانده‌شده" size="small" variant="outlined" color="success" />
    );
  }

  return (
    <Chip
      label={`${unread.toLocaleString("fa-IR")} خوانده‌نشده`}
      size="small"
      color="primary"
    />
  );
}
