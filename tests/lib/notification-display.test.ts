import { describe, expect, it, vi, afterEach } from "vitest";
import type { Notification } from "@/services/notifications/NotificationService";
import {
  getNotificationDateGroup,
  getNotificationSendAccess,
  getNotificationTypeMeta,
  getSendableGroups,
  groupNotificationsByDate,
  notificationDateGroupLabel,
  notificationHref,
  notificationTitle,
  notificationTypeLabel,
} from "@/lib/notification-display";

function notification(partial: Partial<Notification["data"]> & { id?: string }): Notification {
  return {
    id: partial.id ?? "n-1",
    type: "App\\Notifications\\TestNotification",
    read_at: null,
    created_at: "2026-06-12T10:00:00.000Z",
    data: {
      title: partial.title,
      message: partial.message,
      exam_id: partial.exam_id,
      group_id: partial.group_id,
      exam_title: partial.exam_title,
      notification_type: partial.notification_type,
      sent_by_name: partial.sent_by_name,
    },
  };
}

describe("notificationHref", () => {
  it("routes exam notifications to manage page for creators", () => {
    const n = notification({ exam_id: 5, notification_type: "teacher_custom" });
    expect(notificationHref(n, { canManageExams: true })).toBe("/exams/5");
  });

  it("routes participant_added to available exams list", () => {
    const n = notification({ exam_id: 5, notification_type: "participant_added" });
    expect(notificationHref(n, { canManageExams: false })).toBe("/exams/available");
  });

  it("routes exam reminders to take page for participants", () => {
    const n = notification({ exam_id: 9, notification_type: "exam_reminder_30m" });
    expect(notificationHref(n, { canManageExams: false })).toBe("/exams/take/9");
  });

  it("routes teacher_custom to take page for participants", () => {
    const n = notification({ exam_id: 3, notification_type: "teacher_custom" });
    expect(notificationHref(n, { canManageExams: false })).toBe("/exams/take/3");
  });

  it("returns null for admin_broadcast", () => {
    const n = notification({ notification_type: "admin_broadcast", message: "sys" });
    expect(notificationHref(n, { canManageExams: false })).toBeNull();
  });

  it("routes group_message to group page only for managers", () => {
    const n = notification({ group_id: 2, notification_type: "group_message" });
    expect(notificationHref(n, { canManageExams: true })).toBe("/groups/2");
    expect(notificationHref(n, { canManageExams: false })).toBeNull();
  });
});

describe("getNotificationSendAccess", () => {
  it("hides send tab for students", () => {
    const access = getNotificationSendAccess({ permissions: [] }, 0);
    expect(access.showSendTab).toBe(false);
    expect(access.canAdminBroadcast).toBe(false);
    expect(access.canGroupSend).toBe(false);
  });

  it("shows admin broadcast for manage users permission", () => {
    const access = getNotificationSendAccess({ permissions: ["manage users"] }, 0);
    expect(access.showSendTab).toBe(true);
    expect(access.canAdminBroadcast).toBe(true);
    expect(access.canGroupSend).toBe(false);
  });

  it("shows group send for creator with sendable groups", () => {
    const access = getNotificationSendAccess({ permissions: ["create exams"] }, 2);
    expect(access.showSendTab).toBe(true);
    expect(access.canAdminBroadcast).toBe(false);
    expect(access.canGroupSend).toBe(true);
  });

  it("hides group send for creator without sendable groups", () => {
    const access = getNotificationSendAccess({ permissions: ["create exams"] }, 0);
    expect(access.showSendTab).toBe(false);
    expect(access.canGroupSend).toBe(false);
  });

  it("content_manager cannot send notifications", () => {
    const access = getNotificationSendAccess({ permissions: ["manage questions"] }, 5);
    expect(access.showSendTab).toBe(false);
  });
});

describe("getSendableGroups", () => {
  const groups = [
    { id: 1, created_by: 10, teachers: [{ id: 20 }] },
    { id: 2, created_by: 99, teachers: [{ id: 20 }] },
    { id: 3, created_by: 99, teachers: [{ id: 88 }] },
  ];

  it("returns all groups for admin-style access", () => {
    expect(getSendableGroups(groups, 20, true)).toHaveLength(3);
  });

  it("returns owned and teacher groups for creator", () => {
    const result = getSendableGroups(groups, 20, false);
    expect(result.map((g) => g.id)).toEqual([1, 2]);
  });
});

describe("notification display helpers", () => {
  it("uses title fallback chain", () => {
    expect(notificationTitle(notification({ title: "سلام" }))).toBe("سلام");
    expect(notificationTitle(notification({ exam_title: "ریاضی" }))).toBe("ریاضی");
    expect(notificationTitle(notification({}))).toBe("اعلان");
  });

  it("maps notification type labels", () => {
    expect(notificationTypeLabel("group_message")).toBe("پیام گروه");
    expect(notificationTypeLabel("unknown")).toBe("اعلان");
  });

  it("maps notification type meta tones", () => {
    expect(getNotificationTypeMeta("admin_broadcast")).toEqual({
      label: "سیستمی",
      tone: "warning",
    });
  });
});

describe("groupNotificationsByDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups items into today, yesterday, and earlier", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T15:00:00.000Z"));

    const today = "2026-06-12T10:00:00.000Z";
    const yesterday = "2026-06-11T10:00:00.000Z";
    const earlier = "2026-06-01T10:00:00.000Z";

    expect(getNotificationDateGroup(today)).toBe("today");
    expect(getNotificationDateGroup(yesterday)).toBe("yesterday");
    expect(getNotificationDateGroup(earlier)).toBe("earlier");

    const grouped = groupNotificationsByDate([
      { id: "a", created_at: today },
      { id: "b", created_at: yesterday },
      { id: "c", created_at: earlier },
    ] as Notification[]);

    expect(grouped.map((g) => g.key)).toEqual(["today", "yesterday", "earlier"]);
    expect(grouped[0].label).toBe(notificationDateGroupLabel("today"));
    expect(grouped[0].items).toHaveLength(1);
  });
});
