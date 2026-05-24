"use client";

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import type { Notification } from '@/services/notifications/NotificationService';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onClose?: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'همین الان';
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onClose,
}: NotificationListProps) {
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleItemClick = (item: Notification) => {
    if (!item.read_at) {
      onMarkAsRead(item.id);
    }
    onClose?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 200 }}>
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold">
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            اعلانی وجود ندارد
          </Typography>
        </Box>
      ) : (
        <List sx={{ overflow: 'auto', flex: 1 }}>
          {notifications.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                sx={{
                  py: 1.5,
                  bgcolor: item.read_at ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemText
                  primary={item.data?.title || item.data?.message || 'اعلان'}
                  secondary={
                    <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                      {item.data?.message && item.data?.title && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          {item.data.message}
                        </Typography>
                      )}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {formatRelativeTime(item.created_at)}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: item.read_at ? 'normal' : 'medium' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
