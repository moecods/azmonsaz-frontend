"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
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

function noteHasContent(note: GraderNoteValue): boolean {
  return Boolean(
    note.text?.trim() ||
      note.audio_media_id ||
      note.audio_url ||
      note.requires_acknowledgment
  );
}

function toResultQuestion(question: GradingQuestionData, score: number): ResultQuestion {
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
  const [noteOpen, setNoteOpen] = useState(() => noteHasContent(note));

  const isPending = question.is_pending_grading;

  const statusLabel = isPending
    ? question.manual_score != null
      ? "نمره‌دهی شده"
      : "در انتظار نمره"
    : question.is_correct
      ? "صحیح"
      : "نیاز به بازبینی";
  const statusColor = isPending
    ? question.manual_score != null
      ? "success"
      : "warning"
    : question.is_correct
      ? "success"
      : "default";

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
    <Box ref={scrollAnchorRef} id={`grading-question-${question.exam_question_id}`}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: isPending ? "warning.light" : "divider",
          bgcolor: isPending ? "warning.50" : "background.paper",
          transition: "border-color 0.2s, background-color 0.2s",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "flex-start" }}
              spacing={1.5}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`سوال ${index + 1}`} size="small" color="primary" />
                <Chip
                  size="small"
                  variant="outlined"
                  label={QUESTION_TYPE_LABELS[question.question_type] ?? question.question_type}
                />
                <Chip label={statusLabel} color={statusColor} size="small" />
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                <TextField
                  type="number"
                  size="small"
                  label="نمره"
                  value={score}
                  onChange={(e) => onScoreChange(e.target.value)}
                  inputProps={{ min: 0, max: question.max_points }}
                  sx={{ width: 88 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  از {question.max_points}
                  {question.auto_score > 0 ? ` · خودکار: ${question.auto_score}` : ""}
                </Typography>
                {showAiButton && question.question_type === "essay" && onAiGrade && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={aiLoading ? <CircularProgress size={16} /> : <SmartToyIcon />}
                    onClick={onAiGrade}
                    disabled={aiLoading}
                  >
                    AI
                  </Button>
                )}
              </Stack>
            </Stack>

            <RichLabel
              html={question.question_text}
              fontSize="1.05rem"
              compact={false}
              fullContent
              sx={{ fontWeight: 600, lineHeight: 1.75, width: "100%" }}
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <QuestionView
                mode="result"
                source={source as Record<string, unknown>}
                resultQuestion={resultQuestion}
                resultAudience="grader"
              />
            </Box>

            {noteOpen || noteHasContent(note) ? (
              <Collapse in={noteOpen || noteHasContent(note)}>
                <GraderNoteInput label="یادداشت این سوال (اختیاری)" value={note} onChange={onNoteChange} />
              </Collapse>
            ) : (
              <Button
                size="small"
                variant="text"
                startIcon={<NoteAddOutlinedIcon />}
                onClick={() => setNoteOpen(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                افزودن یادداشت برای این سوال
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
