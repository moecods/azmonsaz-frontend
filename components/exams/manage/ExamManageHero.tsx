"use client";

import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import GradeIcon from "@mui/icons-material/Grade";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { ExamCapabilities, ExamWithParticipants } from "@/services/exams/ExamService";
import { getManageExamChips, getManageExamSchedule } from "@/lib/exam-manage-utils";

interface ExamManageHeroProps {
  exam: ExamWithParticipants;
  capabilities: ExamCapabilities;
  onEdit: () => void;
  onQuestions: () => void;
  onGrading: () => void;
  onOpenActionsMenu: (el: HTMLElement) => void;
}

export function ExamManageHero({
  exam,
  capabilities,
  onEdit,
  onQuestions,
  onGrading,
  onOpenActionsMenu,
}: ExamManageHeroProps) {
  const theme = useTheme();
  const chips = getManageExamChips(exam);
  const schedule = getManageExamSchedule(exam);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 60%)`,
      }}
    >
      <Stack spacing={0} sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-start" }}
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={exam.title}
            >
              {exam.title}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
              {chips.map((chip) => (
                <Chip
                  key={`${chip.label}-${chip.color}`}
                  label={chip.label}
                  size="small"
                  color={chip.color}
                  variant={chip.variant ?? "outlined"}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="flex-start">
              <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary", mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {schedule}
              </Typography>
            </Stack>
          </Box>

          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            sx={{ flexShrink: 0, justifyContent: { xs: "stretch", md: "flex-end" } }}
          >
            {capabilities.can_manage_content && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={onEdit}
                sx={{ flex: { xs: 1, sm: "none" } }}
              >
                ویرایش
              </Button>
            )}
            {capabilities.can_manage_content && (
              <Button
                variant="outlined"
                startIcon={<QuestionAnswerIcon />}
                onClick={onQuestions}
                sx={{ flex: { xs: 1, sm: "none" } }}
              >
                سوالات
              </Button>
            )}
            {capabilities.can_grade && (
              <Button
                variant="outlined"
                startIcon={<GradeIcon />}
                onClick={onGrading}
                sx={{ flex: { xs: 1, sm: "none" } }}
              >
                تصحیح
              </Button>
            )}
            <IconButton
              aria-label="عملیات بیشتر"
              onClick={(e) => onOpenActionsMenu(e.currentTarget)}
              sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper" }}
              data-cy="exam-actions-menu"
            >
              <MoreVertIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
