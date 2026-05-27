import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadParticipantsCsv(
  participants: UserParticipant[],
  examTitle: string
): void {
  const header = [
    "نام",
    "تلفن",
    "وضعیت",
    "نمره",
    "از",
    "قبول",
    "شروع",
    "پایان",
    "گروه",
  ];
  const rows = participants.map((p) => [
    p.user?.name ?? "",
    p.user?.phone_number ?? "",
    p.status ?? "",
    p.score != null ? String(p.score) : "",
    p.total_points != null ? String(p.total_points) : "",
    p.passed ? "بله" : "خیر",
    p.started_at ?? "",
    p.completed_at ?? "",
    p.group?.name ?? "",
  ]);

  const lines = [header, ...rows].map((row) =>
    row.map((c) => escapeCsvCell(String(c))).join(",")
  );
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `participants-${examTitle.slice(0, 40).replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
