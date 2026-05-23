"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuditLogs } from "@/hooks/useAuditLogs";

interface AdminAuditLogsTabProps {
  isActive: boolean;
}

export function AdminAuditLogsTab({ isActive }: AdminAuditLogsTabProps) {
  const { data, isLoading, isError, error } = useAuditLogs(isActive ? { per_page: 30 } : undefined);

  if (!isActive) return null;

  const logs = data?.data ?? [];

  return (
    <Stack spacing={3}>
      <Typography variant="h6">لاگ تغییرات آزمون</Typography>
      {isError && (
        <Alert severity="error">{error instanceof Error ? error.message : "خطا در بارگذاری لاگ‌ها"}</Alert>
      )}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>رویداد</TableCell>
                <TableCell>موضوع</TableCell>
                <TableCell>کاربر</TableCell>
                <TableCell>جزئیات</TableCell>
                <TableCell>زمان</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      لاگی ثبت نشده است.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.event}</TableCell>
                    <TableCell>
                      {log.subject_type} #{log.subject_id}
                    </TableCell>
                    <TableCell>{log.actor?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ display: "block", maxWidth: 280 }} noWrap>
                        {JSON.stringify(log.properties ?? {})}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
