import type { ReactNode } from "react";
import { hasPermission } from "@/lib/permissions";
import type { Notification } from "@/services/notifications/NotificationService";

export type NotificationFilter = "all" | "unread";

export function notificationTitle(n: Notification): string {
  return n.data?.title ?? n.data?.exam_title ?? "اعلان";
}

export function notificationBody(n: Notification): string {
  return n.data?.message ?? "";
}

export function notificationTypeKey(n: Notification): string {
  return n.data?.notification_type ?? "default";
}

export interface NotificationHrefOptions {
  /** Creator/admin — opens exam management. Otherwise participant routes apply. */
  canManageExams?: boolean;
}

export function notificationHref(
  n: Notification,
  options?: NotificationHrefOptions
): string | null {
  const type = notificationTypeKey(n);
  const canManageExams = options?.canManageExams ?? false;

  if (type === "admin_broadcast") {
    return null;
  }

  if (n.data?.group_id) {
    return canManageExams ? `/groups/${n.data.group_id}` : null;
  }

  if (n.data?.exam_id) {
    const examId = n.data.exam_id;
    if (canManageExams) {
      return `/exams/${examId}`;
    }

    switch (type) {
      case "exam_reminder_1d":
      case "exam_reminder_30m":
      case "teacher_custom":
        return `/exams/take/${examId}`;
      case "participant_added":
      default:
        return "/exams/available";
    }
  }

  return null;
}

export function notificationTypeLabel(type: string): string {
  switch (type) {
    case "teacher_custom":
      return "پیام آزمون";
    case "participant_added":
      return "ثبت‌نام آزمون";
    case "exam_reminder_1d":
      return "یادآوری یک روز قبل";
    case "exam_reminder_30m":
      return "یادآوری ۳۰ دقیقه قبل";
    case "admin_broadcast":
      return "اعلان سیستمی";
    case "group_message":
      return "پیام گروه";
    default:
      return "اعلان";
  }
}

export function formatNotificationRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "همین الان";
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return date.toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNotificationDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Groups where creator can send messages (owner or granted teacher). */
export function getSendableGroups<T extends { id: number; created_by: number; teachers?: { id: number }[] }>(
  groups: T[],
  userId: number,
  includeAllGroups: boolean
): T[] {
  if (includeAllGroups) return groups;
  return groups.filter(
    (g) => g.created_by === userId || g.teachers?.some((t) => t.id === userId)
  );
}

export interface NotificationSendAccess {
  /** Admin system broadcast — requires manage users */
  canAdminBroadcast: boolean;
  /** Group message — requires create exams + teacher access in at least one group */
  canGroupSend: boolean;
  /** Whether the send tab should appear at all */
  showSendTab: boolean;
}

export function getNotificationSendAccess(
  user: { permissions?: string[] } | null | undefined,
  sendableGroupCount: number
): NotificationSendAccess {
  const canAdminBroadcast = hasPermission(user?.permissions, "manage users");
  const canGroupSend =
    sendableGroupCount > 0 && (canAdminBroadcast || hasPermission(user?.permissions, "create exams"));

  return {
    canAdminBroadcast,
    canGroupSend,
    showSendTab: canAdminBroadcast || canGroupSend,
  };
}

export type NotificationTypeMeta = { label: string; tone: "primary" | "secondary" | "info" | "warning" };

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  switch (type) {
    case "admin_broadcast":
      return { label: "سیستمی", tone: "warning" };
    case "group_message":
      return { label: "گروه", tone: "secondary" };
    case "teacher_custom":
      return { label: "آزمون", tone: "primary" };
    case "exam_reminder_1d":
    case "exam_reminder_30m":
      return { label: "یادآوری", tone: "info" };
    case "participant_added":
      return { label: "ثبت‌نام", tone: "info" };
    default:
      return { label: "اعلان", tone: "info" };
  }
}

export type NotificationDateGroup = "today" | "yesterday" | "earlier";

export function getNotificationDateGroup(dateStr: string): NotificationDateGroup {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  return "earlier";
}

export function notificationDateGroupLabel(group: NotificationDateGroup): string {
  switch (group) {
    case "today":
      return "امروز";
    case "yesterday":
      return "دیروز";
    default:
      return "قبل‌تر";
  }
}

export function groupNotificationsByDate<T extends { created_at: string }>(
  items: T[]
): Array<{ key: NotificationDateGroup; label: string; items: T[] }> {
  const order: NotificationDateGroup[] = ["today", "yesterday", "earlier"];
  const buckets = new Map<NotificationDateGroup, T[]>();

  for (const item of items) {
    const key = getNotificationDateGroup(item.created_at);
    const list = buckets.get(key) ?? [];
    list.push(item);
    buckets.set(key, list);
  }

  return order
    .filter((key) => (buckets.get(key)?.length ?? 0) > 0)
    .map((key) => ({
      key,
      label: notificationDateGroupLabel(key),
      items: buckets.get(key) ?? [],
    }));
}

/** Placeholder for icon mapping in components that import MUI icons locally. */
export type NotificationIconResolver = (type: string) => ReactNode;
