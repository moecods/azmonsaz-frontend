"use client";

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks";
import { hasPermission } from "@/lib/permissions";
import type { Notification } from "@/services/notifications/NotificationService";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { notificationHref } from "@/lib/notification-display";

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onClose?: () => void;
}

export default function NotificationList({
  notifications,
  isLoading,
  onClose,
}: NotificationListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const canManageExams = hasPermission(user?.permissions, "view exams");
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handlePress = (item: Notification) => {
    if (!item.read_at) {
      markAsRead.mutate(item.id);
    }
    onClose?.();
    const href = notificationHref(item, { canManageExams });
    if (href) router.push(href);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 200, maxHeight: 420 }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          اعلان‌ها
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            خواندن همه
          </Button>
        )}
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            اعلانی وجود ندارد
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflow: "auto", flex: 1, py: 0 }}>
          {notifications.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              compact
              canManageExams={canManageExams}
              autoMarkRead
              onMarkRead={(id) => markAsRead.mutate(id)}
              onPress={handlePress}
            />
          ))}
        </Box>
      )}
      <Box
        sx={{
          borderTop: 1,
          borderColor: "divider",
          px: 1.5,
          py: 1,
          textAlign: "center",
        }}
      >
        <Button
          component={Link}
          href="/notifications"
          size="small"
          fullWidth
          onClick={() => onClose?.()}
        >
          مشاهده همه
        </Button>
      </Box>
    </Box>
  );
}
