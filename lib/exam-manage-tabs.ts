export type ExamManageTab =
  | "overview"
  | "participants"
  | "reports"
  | "notifications"
  | "settings";

export function examManageTabFromIndex(index: number): ExamManageTab {
  if (index === 1) return "participants";
  if (index === 2) return "reports";
  if (index === 3) return "notifications";
  if (index === 4) return "settings";
  return "overview";
}

export function examManageIndexFromTab(tab: ExamManageTab): number {
  if (tab === "participants") return 1;
  if (tab === "reports") return 2;
  if (tab === "notifications") return 3;
  if (tab === "settings") return 4;
  return 0;
}

export function parseExamManageTab(param: string | null): ExamManageTab {
  if (
    param === "participants" ||
    param === "reports" ||
    param === "notifications" ||
    param === "settings" ||
    param === "overview"
  ) {
    return param;
  }
  // legacy
  if (param === "info") return "overview";
  return "overview";
}
