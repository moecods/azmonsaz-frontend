"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { RichLabel } from "@/components/editor";
import QuestionView from "@/components/questions/QuestionView";
import type { ResultQuestion } from "@/components/questions/QuestionResultDisplay";
import GraderNoteInput, { GraderNoteValue } from "@/components/exams/GraderNoteInput";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: "چندگزینه‌ای",
  multiple_select: "چندانتخابی",
  true_false: "درست/نادرست",
  essay: "تشریحی",
  short_answer: "پاسخ کوتاه",
  fill_blank: "جای خالی",
  fill_in_the_blank: "جای خالی",
  ordering: "مرتب‌سازی",
  matching: "تطبیق",
};

export interface GradingQuestionData {
  exam_question_id: number;
  question_text: string;
  question_type: string;
  answer: unknown;
  correct_answer?: unknown;
  options?: unknown;
  items?: unknown;
  left_items?: unknown;
  right_items?: unknown;
  matches?: unknown;
  blanks?: unknown;
  correct_order?: unknown;
  display_settings?: Record<string, unknown>;
  is_correct?: boolean;
  is_pending_grading?: boolean;
  manual_score?: number | null;
  auto_score: number;
  effective_score: number;
  max_points: number;
}

interface GradingQuestionCardProps {
  index: number;
  question: GradingQuestionData;
  score: number;
  onScoreChange: (value: string) => void;
  note: GraderNoteValue;
  onNoteChange: (note: GraderNoteValue) => void;
  showAiButton?: boolean;
  aiLoading?: boolean;
  onAiGrade?: () => void;
  scrollAnchorRef?: (el: HTMLDivElement | null) => void;
}

function toResultQuestion(
  question: GradingQuestionData,
  score: number
): ResultQuestion {
  return {
    id: question.exam_question_id,
    type: question.question_type,
    question_text: question.question_text,
    options: question.options as ResultQuestion["options"],
    correct_answer: question.correct_answer as ResultQuestion["correct_answer"],
    your_answer: question.answer as ResultQuestion["your_answer"],
    is_correct: question.is_correct,
    is_pending_grading: question.is_pending_grading,
    points_earned: score,
    points_total: question.max_points,
    items: question.items as ResultQuestion["items"],
    left_items: question.left_items as ResultQuestion["left_items"],
    right_items: question.right_items as ResultQuestion["right_items"],
    matches: question.matches as ResultQuestion["matches"],
    blanks: question.blanks as ResultQuestion["blanks"],
  };
}

export default function GradingQuestionCard({
  index,
  question,
  score,
  onScoreChange,
  note,
  onNoteChange,
  showAiButton,
  aiLoading,
  onAiGrade,
  scrollAnchorRef,
}: GradingQuestionCardProps) {
  const isPending = question.is_pending_grading;
  const statusLabel = isPending
    ? "در انتظار نمره‌دهی"
    : question.is_correct
      ? "صحیح"
      : "نیاز به بازبینی";
  const statusColor = isPending ? "info" : question.is_correct ? "success" : "default";
  const borderColor = isPending
    ? "info.light"
    : question.is_correct
      ? "success.light"
      : "divider";

  const resultQuestion = toResultQuestion(question, score);
  const source = {
    type: question.question_type,
    question_text: question.question_text,
    options: question.options,
    correct_answer: question.correct_answer,
    items: question.items,
    left_items: question.left_items,
    right_items: question.right_items,
    matches: question.matches,
    blanks: question.blanks,
    correct_order: question.correct_order,
    display_settings: question.display_settings,
  };

  return (
    <Box ref={scrollAnchorRef}>
    <Card variant="outlined" sx={{ borderColor, borderWidth: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ justifyContent: 'flex-end' }}
            >
              <Chip label={`سوال ${index + 1}`} size="small" color="primary" variant="outlined" />
              <Chip
                size="small"
                variant="outlined"
                label={QUESTION_TYPE_LABELS[question.question_type] ?? question.question_type}
              />
              <Chip label={statusLabel} color={statusColor} size="small" />
            </Stack>
            <RichLabel
              html={question.question_text}
              fontSize="1.1rem"
              compact={false}
              fullContent
              sx={{ fontWeight: 600, lineHeight: 1.75, width: '100%' }}
            />
          </Stack>

          <QuestionView
            mode="result"
            source={source as Record<string, unknown>}
            resultQuestion={resultQuestion}
            resultAudience="grader"
          />

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <TextField
              type="number"
              size="small"
              label="نمره"
              value={score}
              onChange={(e) => onScoreChange(e.target.value)}
              inputProps={{ min: 0, max: question.max_points }}
              sx={{ width: { xs: "100%", sm: 120 } }}
            />
            <Typography variant="body2" color="text.secondary">
              نمره خودکار: {question.auto_score} / حداکثر: {question.max_points}
            </Typography>
            {showAiButton && question.question_type === "essay" && onAiGrade && (
              <Button
                size="small"
                variant="outlined"
                startIcon={aiLoading ? <CircularProgress size={16} /> : <SmartToyIcon />}
                onClick={onAiGrade}
                disabled={aiLoading}
              >
                تصحیح با AI
              </Button>
            )}
          </Stack>

          <GraderNoteInput label="یادداشت سوال" value={note} onChange={onNoteChange} />
        </Stack>
      </CardContent>
    </Card>
    </Box>
  );
}
