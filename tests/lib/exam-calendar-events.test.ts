import { describe, expect, it } from "vitest";
import {
  buildExamAgendaGroups,
  buildExamWeekDays,
  listUnscheduledExams,
  resolveExamCalendarWindow,
  startOfWeekSaturday,
} from "@/lib/exam-calendar-events";
import type { ExamListItem } from "@/services/exams/ExamService";

function exam(partial: Partial<ExamListItem>): ExamListItem {
  return {
    id: 1,
    title: "Test",
    type: "online",
    partner_id: null,
    status: "published",
    is_active: true,
    published_at: null,
    registration_link: null,
    exam_link: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    questions_count: 0,
    participants_count: 0,
    completed_participants_count: 0,
    ...partial,
  };
}

describe("resolveExamCalendarWindow", () => {
  it("uses calendar_start_at and calendar_end_at when provided", () => {
    const window = resolveExamCalendarWindow(
      exam({
        calendar_start_at: "2026-05-10T08:00:00.000Z",
        calendar_end_at: "2026-05-10T10:00:00.000Z",
      })
    );
    expect(window?.start.toISOString()).toBe("2026-05-10T08:00:00.000Z");
    expect(window?.end.toISOString()).toBe("2026-05-10T10:00:00.000Z");
  });

  it("returns null for schedule none", () => {
    expect(
      resolveExamCalendarWindow(exam({ schedule_type: "none" }))
    ).toBeNull();
  });

  it("resolves flexible_until from available_from and due_by", () => {
    const window = resolveExamCalendarWindow(
      exam({
        schedule_type: "flexible_until",
        available_from: "2026-05-12T00:00:00.000Z",
        due_by: "2026-05-15T23:59:00.000Z",
      })
    );
    expect(window?.allDay).toBe(true);
    expect(window?.start.toISOString()).toBe("2026-05-12T00:00:00.000Z");
  });
});

describe("buildExamWeekDays", () => {
  it("places exam on correct day of week", () => {
    const weekStart = startOfWeekSaturday(new Date("2026-05-16T12:00:00"));
    const days = buildExamWeekDays(
      [
        exam({
          id: 42,
          title: "Math",
          calendar_start_at: "2026-05-17T09:00:00.000Z",
          calendar_end_at: "2026-05-17T11:00:00.000Z",
        }),
      ],
      weekStart
    );
    const withExam = days.filter((d) => d.placements.some((p) => p.exam.id === 42));
    expect(withExam.length).toBeGreaterThanOrEqual(1);
  });
});

describe("buildExamAgendaGroups", () => {
  it("groups only days that have exams", () => {
    const weekStart = startOfWeekSaturday(new Date("2026-05-10T12:00:00"));
    const groups = buildExamAgendaGroups(
      [
        exam({
          calendar_start_at: "2026-05-12T08:00:00.000Z",
          calendar_end_at: "2026-05-12T10:00:00.000Z",
        }),
      ],
      weekStart,
      new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    );
    expect(groups.length).toBe(1);
    expect(groups[0].placements).toHaveLength(1);
  });
});

describe("listUnscheduledExams", () => {
  it("lists exams without a calendar window", () => {
    const unscheduled = listUnscheduledExams([
      exam({ schedule_type: "none" }),
      exam({
        calendar_start_at: "2026-05-12T08:00:00.000Z",
        calendar_end_at: "2026-05-12T10:00:00.000Z",
      }),
    ]);
    expect(unscheduled).toHaveLength(1);
    expect(unscheduled[0].schedule_type).toBe("none");
  });
});
