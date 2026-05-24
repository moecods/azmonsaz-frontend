"use client";

import { useState, useRef, useEffect } from 'react';
import { IconButton, Badge, Popover, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications, useMarkNotificationAsRead } from '@/hooks/useNotifications';
import NotificationList from './NotificationList';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data, isLoading } = useNotifications({ per_page: 15 });
  const markAsRead = useMarkNotificationAsRead();

  const unreadCount = data?.data?.filter((n) => !n.read_at).length ?? 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="اعلان‌ها"
        aria-controls={open ? 'notification-popover' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        data-cy="notification-bell"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id="notification-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 320,
              maxHeight: 400,
            },
          },
        }}
      >
        <NotificationList
          notifications={data?.data ?? []}
          isLoading={isLoading}
          onMarkAsRead={(id) => markAsRead.mutate(id)}
          onClose={handleClose}
        />
      </Popover>
    </>
  );
}
