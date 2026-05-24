"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { AvailableExam } from "@/services/exams/ExamService";
import {
  getExamDisplayStatus,
  formatExamSchedule,
  formatResultScoreLabel,
  type ExamDisplayStatus,
} from "@/lib/student-dashboard";
import {
  getExamHistoryHref,
  getExamStatusChipColor,
  getExamStatusLabel,
  sortExamsForHistory,
} from "@/lib/profile-utils";

type FilterKey = "all" | ExamDisplayStatus;

interface ProfileExamsPanelProps {
  exams: AvailableExam[];
}

export function ProfileExamsPanel({ exams }: ProfileExamsPanelProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");

  const sorted = useMemo(() => sortExamsForHistory(exams), [exams]);

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((e) => getExamDisplayStatus(e) === filter);
  }, [sorted, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: sorted.length };
    for (const e of sorted) {
      const s = getExamDisplayStatus(e);
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [sorted]);

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "همه" },
    { key: "registered", label: "ثبت‌نام‌شده" },
    { key: "started", label: "در حال انجام" },
    { key: "completed", label: "تکمیل‌شده" },
    { key: "time_ended", label: "مهلت تمام" },
    { key: "absent", label: "غیبت" },
  ];

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          آزمون‌های من
        </Typography>
        <Typography variant="body2" color="text.secondary">
          فهرست آزمون‌هایی که در آن‌ها ثبت‌نام کرده‌اید — به‌ترتیب جدیدترین فعالیت.
        </Typography>
      </Box>

      <Tabs
        value={filter}
        onChange={(_, v: FilterKey) => setFilter(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ minHeight: 40 }}
      >
        {tabs.map((t) => {
          const count = counts[t.key] ?? 0;
          if (t.key !== "all" && count === 0) return null;
          return (
            <Tab
              key={t.key}
              value={t.key}
              label={`${t.label}${count > 0 ? ` (${count.toLocaleString("fa-IR")})` : ""}`}
              sx={{ minHeight: 40, py: 0.5 }}
            />
          );
        })}
      </Tabs>

      {filtered.length === 0 ? (
        <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {exams.length === 0
              ? "هنوز در آزمونی ثبت‌نام نکرده‌اید."
              : "آزمونی با این وضعیت نیست."}
          </Typography>
          <Button variant="contained" onClick={() => router.push("/exams/available")}>
            مشاهده آزمون‌های در دسترس
          </Button>
        </Card>
      ) : (
        <Stack spacing={1}>
          {filtered.map((exam) => {
            const display = getExamDisplayStatus(exam);
            const schedule = formatExamSchedule(exam);
            const score = formatResultScoreLabel(exam);
            const href = getExamHistoryHref(exam);

            return (
              <Card
                key={exam.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "box-shadow 0.15s ease",
                  "&:hover": { boxShadow: 2 },
                }}
                onClick={() => router.push(href)}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2, py: 1.5 }}
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap title={exam.title}>
                      {exam.title}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={getExamStatusLabel(display)}
                        color={getExamStatusChipColor(display)}
                        variant="outlined"
                      />
                      {schedule && (
                        <Typography variant="caption" color="text.secondary">
                          {schedule}
                        </Typography>
                      )}
                      {score && (
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          {score}
                        </Typography>
                      )}
                      {exam.creator?.name && (
                        <Typography variant="caption" color="text.disabled">
                          · {exam.creator.name}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <ChevronLeftIcon color="action" sx={{ flexShrink: 0 }} />
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      {exams.length > 0 && (
        <Button variant="text" onClick={() => router.push("/exams/available")} sx={{ alignSelf: "flex-start" }}>
          همه آزمون‌های در دسترس
        </Button>
      )}
    </Stack>
  );
}
