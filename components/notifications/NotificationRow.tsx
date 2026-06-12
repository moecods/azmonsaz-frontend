"use client";

import { useEffect, useRef } from "react";
import {
  Box,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupsIcon from "@mui/icons-material/Groups";
import QuizIcon from "@mui/icons-material/Quiz";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import type { Notification } from "@/services/notifications/NotificationService";
import {
  formatNotificationRelativeTime,
  getNotificationTypeMeta,
  notificationBody,
  notificationHref,
  notificationTitle,
  notificationTypeKey,
} from "@/lib/notification-display";

function NotificationTypeIcon({ type }: { type: string }) {
  const sx = { fontSize: 20 };
  switch (type) {
    case "admin_broadcast":
      return <CampaignIcon sx={sx} />;
    case "group_message":
      return <GroupsIcon sx={sx} />;
    case "teacher_custom":
      return <ChatIcon sx={sx} />;
    case "exam_reminder_1d":
    case "exam_reminder_30m":
      return <ScheduleIcon sx={sx} />;
    case "participant_added":
      return <PersonAddIcon sx={sx} />;
    default:
      return <NotificationsNoneIcon sx={sx} />;
  }
}

interface NotificationRowProps {
  item: Notification;
  onPress?: (item: Notification) => void;
  onMarkRead?: (id: string) => void;
  autoMarkRead?: boolean;
  compact?: boolean;
  canManageExams?: boolean;
}

export function NotificationRow({
  item,
  onPress,
  onMarkRead,
  autoMarkRead = false,
  compact = false,
  canManageExams = false,
}: NotificationRowProps) {
  const theme = useTheme();
  const rowRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef(false);
  const isUnread = !item.read_at;
  const typeKey = notificationTypeKey(item);
  const typeMeta = getNotificationTypeMeta(typeKey);
  const body = notificationBody(item);
  const href = notificationHref(item, { canManageExams });
  const isClickable = Boolean(onPress && href);

  useEffect(() => {
    if (!autoMarkRead || !isUnread || !onMarkRead || markedRef.current) return;

    const node = rowRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !markedRef.current) {
          timer = setTimeout(() => {
            if (!markedRef.current) {
              markedRef.current = true;
              onMarkRead(item.id);
            }
          }, 600);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.55 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [autoMarkRead, isUnread, item.id, onMarkRead]);

  return (
    <Box
      ref={rowRef}
      component={isClickable ? "button" : "div"}
      type={isClickable ? "button" : undefined}
      onClick={isClickable ? () => onPress?.(item) : undefined}
      sx={{
        width: "100%",
        border: "none",
        background: "transparent",
        textAlign: "inherit",
        cursor: isClickable ? "pointer" : "default",
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        px: compact ? 1.5 : { xs: 1.5, sm: 2 },
        py: compact ? 1.25 : 1.5,
        bgcolor: isUnread ? alpha(theme.palette.primary.main, 0.04) : "transparent",
        transition: "background-color 0.15s ease",
        WebkitTapHighlightColor: "transparent",
        "&:hover": isClickable
          ? { bgcolor: alpha(theme.palette.primary.main, 0.07) }
          : undefined,
      }}
    >
      <Box sx={{ position: "relative", flexShrink: 0, mt: 0.25 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isUnread
              ? alpha(theme.palette.primary.main, 0.14)
              : alpha(theme.palette.action.hover, 0.1),
            color: isUnread ? "primary.main" : "text.secondary",
          }}
        >
          <NotificationTypeIcon type={typeKey} />
        </Box>
        {isUnread && (
          <Box
            sx={{
              position: "absolute",
              top: -2,
              left: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              border: 2,
              borderColor: "background.paper",
            }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography
            variant="body2"
            fontWeight={isUnread ? 700 : 600}
            sx={{ lineHeight: 1.45, flex: 1, minWidth: 0 }}
          >
            {notificationTitle(item)}
          </Typography>
          <Chip
            label={typeMeta.label}
            size="small"
            color={typeMeta.tone}
            variant="outlined"
            sx={{ height: 20, fontSize: "0.65rem" }}
          />
        </Stack>

        {body ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.55,
            }}
          >
            {body}
          </Typography>
        ) : null}

        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ mt: 0.75, color: "text.disabled" }}
        >
          <Typography variant="caption">
            {formatNotificationRelativeTime(item.created_at)}
          </Typography>
          {item.data?.sent_by_name && (
            <>
              <Typography variant="caption">·</Typography>
              <Typography variant="caption">{item.data.sent_by_name}</Typography>
            </>
          )}
        </Stack>
      </Box>

      {isClickable && (
        <ChevronLeftIcon sx={{ fontSize: 18, color: "text.disabled", mt: 1, flexShrink: 0 }} />
      )}
    </Box>
  );
}
