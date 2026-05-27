"use client";

import {
  Alert,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { ExamWithParticipants } from "@/services/exams/ExamService";

interface ExamManageLifecycleCardProps {
  exam: ExamWithParticipants;
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <ListItem disableGutters sx={{ py: 0.25 }}>
      <ListItemIcon sx={{ minWidth: 32 }}>
        {done ? (
          <CheckCircleOutlineIcon color="success" fontSize="small" />
        ) : (
          <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          variant: "body2",
          color: done ? "text.primary" : "text.secondary",
        }}
      />
    </ListItem>
  );
}

export function ExamManageLifecycleCard({ exam }: ExamManageLifecycleCardProps) {
  const theme = useTheme();
  const hasQuestions = (exam.questions_count ?? 0) > 0;
  const isPublished = exam.status === "published";
  const isActive = exam.is_active;

  const statusLabel = !isPublished
    ? "پیش‌نویس"
    : isActive
      ? "منتشرشده · فعال"
      : "منتشرشده · غیرفعال";

  const statusColor = !isPublished ? "default" : isActive ? "success" : "warning";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          وضعیت و انتشار
        </Typography>
        <Chip label={statusLabel} size="small" color={statusColor} variant="outlined" />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
        «انتشار» آزمون را برای شرکت‌کنندگان قابل‌دسترس می‌کند؛ «فعال» بودن تعیین می‌کند در بازه
        زمانی فعلی بتوانند وارد شوند یا نه.
      </Typography>

      <List dense disablePadding>
        <CheckItem done={hasQuestions} label="حداقل یک سوال در آزمون" />
        <CheckItem done={isPublished} label="آزمون منتشر شده" />
        <CheckItem done={isActive} label="آزمون فعال است" />
      </List>

      {!hasQuestions && (
        <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
          برای انتشار، از منوی عملیات یا بخش سوالات، حداقل یک سوال اضافه کنید.
        </Alert>
      )}
    </Box>
  );
}
