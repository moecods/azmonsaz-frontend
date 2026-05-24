import { describe, expect, it } from "vitest";
import { formatTakeExamDuration, resolveTakeExamTiming } from "@/lib/exam-take-timing";

describe("formatTakeExamDuration", () => {
  it("formats mm:ss under one hour", () => {
    expect(formatTakeExamDuration(125)).toBe("2:05");
  });

  it("formats h:mm:ss at or above one hour", () => {
    expect(formatTakeExamDuration(3661)).toBe("1:01:01");
  });
});

describe("resolveTakeExamTiming", () => {
  it("uses server timing when present", () => {
    const result = resolveTakeExamTiming(
      {
        timing: {
          visible: true,
          remaining_seconds: 600,
          kind: "combined",
          label: "زمان باقی‌مانده",
          hint: "مدت پاسخ 10 دقیقه",
        },
      },
      true
    );
    expect(result.visible).toBe(true);
    expect(result.remaining_seconds).toBe(600);
  });

  it("hides timer when schedule is none", () => {
    const result = resolveTakeExamTiming(
      {
        timing: {
          visible: false,
          remaining_seconds: null,
          kind: "none",
          label: "بدون محدودیت زمانی",
        },
      },
      true
    );
    expect(result.visible).toBe(false);
  });
});
