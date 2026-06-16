"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HistoryIcon from "@mui/icons-material/History";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import {
  AdminEmptyState,
  AdminFilterPanel,
  AdminSectionHeader,
  AdminTableShell,
  adminTableHeadSx,
  adminTableRowSx,
} from "@/components/admin/admin-shared";

const EVENT_OPTIONS = [
  { value: "", label: "همه رویدادها" },
  { value: "exam.updated", label: "به‌روزرسانی آزمون" },
  { value: "grade.changed", label: "تغییر نمره" },
];

const SUBJECT_OPTIONS = [
  { value: "", label: "همه موضوع‌ها" },
  { value: "exam", label: "آزمون" },
  { value: "exam_participant", label: "شرکت‌کننده" },
];

function formatLogTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
}

function formatSubject(type: string, id: number): string {
  if (type === "exam_participant") return `شرکت‌کننده #${id}`;
  if (type === "exam") return `آزمون #${id}`;
  return `${type} #${id}`;
}

export function AdminAuditLogsTab() {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState("");
  const [subjectType, setSubjectType] = useState("");

  const params = useMemo(
    () => ({
      page,
      per_page: 20,
      event: event || undefined,
      subject_type: subjectType || undefined,
    }),
    [page, event, subjectType]
  );

  const hasActiveFilters = Boolean(event || subjectType);
  const { data, isLoading, isError, error } = useAuditLogs(params);

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const resetFilters = () => {
    setEvent("");
    setSubjectType("");
    setPage(1);
  };

  return (
    <Stack spacing={2.5}>
      <AdminSectionHeader
        icon={<HistoryIcon fontSize="small" />}
        title="لاگ تغییرات آزمون"
        subtitle="رویدادهای مهم سیستم"
        count={meta?.total}
      />

      <AdminFilterPanel onReset={resetFilters} showReset={hasActiveFilters}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>رویداد</InputLabel>
          <Select
            label="رویداد"
            value={event}
            onChange={(e) => {
              setEvent(e.target.value);
              setPage(1);
            }}
          >
            {EVENT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>موضوع</InputLabel>
          <Select
            label="موضوع"
            value={subjectType}
            onChange={(e) => {
              setSubjectType(e.target.value);
              setPage(1);
            }}
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </AdminFilterPanel>

      {isError && (
        <Alert severity="error">{error instanceof Error ? error.message : "خطا در بارگذاری لاگ‌ها"}</Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <AdminEmptyState
          icon={<HistoryIcon />}
          title="لاگی یافت نشد"
          description={hasActiveFilters ? "فیلترها را تغییر دهید." : "هنوز رویدادی ثبت نشده است."}
        />
      ) : (
        <AdminTableShell>
          <Table size="small">
            <TableHead>
              <TableRow sx={adminTableHeadSx(theme)}>
                <TableCell>رویداد</TableCell>
                <TableCell>موضوع</TableCell>
                <TableCell>کاربر</TableCell>
                <TableCell>جزئیات</TableCell>
                <TableCell>زمان</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={log.id} hover sx={adminTableRowSx(theme, index)}>
                  <TableCell>
                    <Chip label={log.event} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatSubject(log.subject_type, log.subject_id)}
                    </Typography>
                  </TableCell>
                  <TableCell>{log.actor?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", maxWidth: 320, wordBreak: "break-all" }}
                    >
                      {JSON.stringify(log.properties ?? {})}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatLogTime(log.created_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      )}

      {meta && meta.last_page > 1 && (
        <Box display="flex" justifyContent="center">
          <Pagination
            count={meta.last_page}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Stack>
  );
}
