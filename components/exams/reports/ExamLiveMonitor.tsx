"use client";

import { useMemo, useState } from "react";
import {
  Box,
  FormControlLabel,
  LinearProgress,
  Link,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ExamLiveParticipantRow } from "@/services/exams/ExamReportService";
import { formatRelativeTimeFa } from "@/lib/format-relative-time";
import { ParticipantStatusChip } from "@/components/exams/participants/participant-ui-shared";
import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";

interface ExamLiveMonitorProps {
  rows: ExamLiveParticipantRow[];
  examId: number;
  canGrade?: boolean;
}

function toStatusParticipant(row: ExamLiveParticipantRow): UserParticipant {
  return {
    id: row.participant_id,
    user_id: row.user_id,
    status: row.status,
    started_at: row.started_at,
    is_pending_finalize: row.is_pending_finalize,
    completed_at: null,
    score: null,
    total_points: null,
    passed: false,
    user: {
      id: row.user_id,
      name: row.user_name ?? "—",
      phone_number: row.phone_number,
    },
  } as UserParticipant;
}

export function ExamLiveMonitor({ rows, examId, canGrade }: ExamLiveMonitorProps) {
  const [onlyInProgress, setOnlyInProgress] = useState(false);

  const filtered = useMemo(() => {
    if (!onlyInProgress) return rows;
    return rows.filter((r) => r.status === "started");
  }, [rows, onlyInProgress]);

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        هنوز شرکت‌کننده‌ای ثبت نشده است.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={onlyInProgress}
            onChange={(_, v) => setOnlyInProgress(v)}
          />
        }
        label="فقط در حال انجام"
      />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>نام</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>پیشرفت</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>سوال فعلی</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>آخرین فعالیت</TableCell>
              {canGrade && <TableCell sx={{ fontWeight: 700 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.participant_id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.user_name ?? "—"}
                  </Typography>
                  {row.phone_number && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {row.phone_number}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <ParticipantStatusChip participant={toStatusParticipant(row)} />
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <Stack spacing={0.5}>
                    <LinearProgress
                      variant="determinate"
                      value={row.progress_percent}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {row.answered_count.toLocaleString("fa-IR")} از{" "}
                      {row.total_questions.toLocaleString("fa-IR")}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  {row.current_question ? (
                    <Typography variant="body2">
                      #{row.current_question.order?.toLocaleString("fa-IR") ?? "—"}
                      {row.current_question.title ? ` · ${row.current_question.title}` : ""}
                    </Typography>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{formatRelativeTimeFa(row.last_activity_at)}</Typography>
                </TableCell>
                {canGrade && (
                  <TableCell>
                    <Link href={`/exams/${examId}/grading`} underline="hover" variant="body2">
                      تصحیح
                    </Link>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filtered.length === 0 && (
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            شرکت‌کننده‌ای در حال انجام نیست.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
