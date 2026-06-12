import { describe, expect, it } from "vitest";
import {
  canManageExams,
  getActiveMobileDockTabId,
  getMobileDockQuickPaths,
  getMobileExamsTabPath,
  isExamManagementPath,
  resolveMobileDockTabs,
} from "@/lib/mobile-bottom-nav";

const creatorUser = { permissions: ["view exams", "create exams"] };
const studentUser = { permissions: [] };

describe("mobile-bottom-nav", () => {
  describe("exam tab path by role", () => {
    it("uses exam management for users with view exams", () => {
      expect(canManageExams(creatorUser)).toBe(true);
      expect(getMobileExamsTabPath(creatorUser)).toBe("/exams");
    });

    it("uses available exams for students", () => {
      expect(canManageExams(studentUser)).toBe(false);
      expect(getMobileExamsTabPath(studentUser)).toBe("/exams/available");
    });
  });

  describe("resolveMobileDockTabs", () => {
    it("resolves my-exams path for creator", () => {
      const tabs = resolveMobileDockTabs(creatorUser);
      const examsTab = tabs.find((t) => t.id === "my-exams");
      expect(examsTab?.path).toBe("/exams");
    });

    it("resolves my-exams path for student", () => {
      const tabs = resolveMobileDockTabs(studentUser);
      const examsTab = tabs.find((t) => t.id === "my-exams");
      expect(examsTab?.path).toBe("/exams/available");
    });

    it("uses notifications page route instead of popover action", () => {
      const tabs = resolveMobileDockTabs(studentUser);
      const notificationsTab = tabs.find((t) => t.id === "notifications");
      expect(notificationsTab?.path).toBe("/notifications");
      expect(notificationsTab?.action).toBeUndefined();
    });
  });

  describe("getMobileDockQuickPaths", () => {
    it("includes role-specific exams path and notifications", () => {
      expect(getMobileDockQuickPaths(creatorUser)).toEqual(
        new Set(["/dashboard", "/exams", "/notifications", "/profile"])
      );
      expect(getMobileDockQuickPaths(studentUser)).toEqual(
        new Set(["/dashboard", "/exams/available", "/notifications", "/profile"])
      );
    });
  });

  describe("isExamManagementPath", () => {
    it("treats manage routes as management paths", () => {
      expect(isExamManagementPath("/exams")).toBe(true);
      expect(isExamManagementPath("/exams/12")).toBe(true);
      expect(isExamManagementPath("/exams/create")).toBe(true);
    });

    it("excludes student exam routes", () => {
      expect(isExamManagementPath("/exams/available")).toBe(false);
      expect(isExamManagementPath("/exams/take/abc")).toBe(false);
      expect(isExamManagementPath("/exams/12/result")).toBe(false);
    });
  });

  describe("getActiveMobileDockTabId", () => {
    it("activates notifications tab on notifications page", () => {
      expect(
        getActiveMobileDockTabId("/notifications", {
          menuExpanded: false,
          canManageExams: false,
        })
      ).toBe("notifications");
    });

    it("activates my-exams for student on available page", () => {
      expect(
        getActiveMobileDockTabId("/exams/available", {
          menuExpanded: false,
          canManageExams: false,
        })
      ).toBe("my-exams");
    });

    it("activates my-exams for creator on manage list", () => {
      expect(
        getActiveMobileDockTabId("/exams", {
          menuExpanded: false,
          canManageExams: true,
        })
      ).toBe("my-exams");
    });

    it("activates menu when expanded", () => {
      expect(
        getActiveMobileDockTabId("/dashboard", {
          menuExpanded: true,
          canManageExams: false,
        })
      ).toBe("menu");
    });
  });
});
