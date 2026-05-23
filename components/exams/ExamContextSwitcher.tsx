"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { CreatorDashboardExam } from "@/services/exams/ExamService";

interface ExamContextSwitcherProps {
  exams: CreatorDashboardExam[];
  showCreator?: boolean;
  maxVisible?: number;
}

export default function ExamContextSwitcher({
  exams,
  showCreator = false,
  maxVisible = 8,
}: ExamContextSwitcherProps) {
  const router = useRouter();
  const live = exams.filter((e) => e.is_live);

  if (live.length < 2) return null;

  const visible = live.slice(0, maxVisible);
  const overflow = live.length - visible.length;

  return (
    <Stack spacing={0.75}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        آزمون‌های در حال اجرا
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        {visible.map((exam) => (
          <Chip
            key={exam.id}
            label={
              showCreator && exam.creator?.name
                ? `${exam.title} · ${exam.creator.name}`
                : exam.title
            }
            size="small"
            color="success"
            variant="outlined"
            onClick={() => router.push(`/exams/${exam.id}`)}
            sx={{ maxWidth: 280 }}
          />
        ))}
        {overflow > 0 && (
          <Chip
            size="small"
            label={`+${overflow.toLocaleString("fa-IR")} آزمون`}
            variant="outlined"
            onClick={() => router.push("/exams")}
          />
        )}
      </Stack>
    </Stack>
  );
}
