"use client";

import { useState } from "react";
import { IconButton, Badge, Popover } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationList from "./NotificationList";

export interface NotificationBellProps {
  /** Controlled popover anchor (e.g. mobile dock tab). */
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
  /** Hide default icon trigger (parent provides tab/button). */
  hideTrigger?: boolean;
}

export default function NotificationBell({
  anchorEl: controlledAnchor,
  open: controlledOpen,
  onClose: controlledOnClose,
  hideTrigger = false,
}: NotificationBellProps = {}) {
  const [internalAnchor, setInternalAnchor] = useState<null | HTMLElement>(null);
  const isControlled = controlledOpen !== undefined;
  const anchorEl = isControlled ? (controlledAnchor ?? null) : internalAnchor;
  const open = isControlled ? Boolean(controlledOpen) : Boolean(internalAnchor);
  const { data, isLoading } = useNotifications({ per_page: 15 });

  const unreadCount = data?.data?.filter((n) => !n.read_at).length ?? 0;

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalAnchor(null);
    }
  };

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    setInternalAnchor(event.currentTarget);
  };

  return (
    <>
      {!hideTrigger && (
        <IconButton
          color="inherit"
          onClick={handleTriggerClick}
          aria-label="اعلان‌ها"
          aria-controls={open ? "notification-popover" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          data-cy="notification-bell"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      )}
      <Popover
        id="notification-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              mb: 1,
              width: 320,
              maxHeight: 400,
            },
          },
        }}
      >
        <NotificationList
          notifications={data?.data ?? []}
          isLoading={isLoading}
          onClose={handleClose}
        />
      </Popover>
    </>
  );
}

/** Unread count for badges on custom triggers (mobile dock). */
export function useNotificationUnreadCount(): number {
  const { data } = useNotifications({ per_page: 15 });
  return data?.data?.filter((n) => !n.read_at).length ?? 0;
}
