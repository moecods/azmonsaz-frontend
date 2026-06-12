"use client";

import {
  Card,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import type { Notification } from "@/services/notifications/NotificationService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { hasPermission } from "@/lib/permissions";
import {
  notificationBody,
  notificationHref,
  notificationTitle,
} from "@/lib/notification-display";

interface DashboardNotificationsProps {
  notifications: Notification[];
}

/** Renders notification list only; parent shows empty state when length is 0. */
export default function DashboardNotifications({ notifications }: DashboardNotificationsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const canManageExams = hasPermission(user?.permissions, "view exams");

  return (
    <Card variant="outlined" elevation={0}>
      <List disablePadding>
        {notifications.map((n, index) => {
          const href = notificationHref(n, { canManageExams });
          const isUnread = !n.read_at;

          return (
            <ListItemButton
              key={n.id}
              disabled={!href}
              onClick={() => href && router.push(href)}
              sx={{
                alignItems: "flex-start",
                py: 1,
                borderTop: index > 0 ? "1px solid" : "none",
                borderColor: "divider",
                bgcolor: isUnread ? (theme) => alpha(theme.palette.primary.main, 0.04) : "transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, mt: 0.25, color: "primary.main" }}>
                <NotificationsNoneIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="subtitle2" fontWeight={isUnread ? 700 : 500}>
                      {notificationTitle(n)}
                    </Typography>
                    {isUnread && <Chip label="جدید" size="small" color="primary" sx={{ height: 20 }} />}
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.25} component="span" sx={{ mt: 0.25, display: "block" }}>
                    {notificationBody(n) ? (
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {notificationBody(n)}
                      </Typography>
                    ) : null}
                    <Typography variant="caption" color="text.disabled" component="span" display="block">
                      {new Date(n.created_at).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}
                    </Typography>
                  </Stack>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );
}
