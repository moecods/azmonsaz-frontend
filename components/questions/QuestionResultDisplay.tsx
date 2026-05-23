"use client";

import { Box, Stack, Typography, Chip, Alert } from "@mui/material";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { getQuestionTypeKind } from "@/lib/question-types";
import { normalizeQuestion, optionText } from "@/lib/question-types/normalize-question";
import {
  participantAnswerChipLabel,
  participantAnswerLabel,
  type ResultAudience,
} from "@/lib/exam-result-copy";
import { RichLabel } from "@/components/editor";

export interface ResultQuestion {
  id?: number;
  type: string;
  question_text: string;
  options?: (string | { text: string })[];
  correct_answer?: number | number[] | string | string[] | null;
  your_answer?: number | number[] | string | string[] | null;
  is_correct?: boolean;
  is_pending_grading?: boolean;
  points_earned?: number;
  points_total?: number;
  items?: unknown[];
  left_items?: unknown[];
  right_items?: unknown[];
  matches?: unknown[];
  blanks?: unknown[];
  correct_answers?: string[];
}

function optionLabel(opt: string | { text: string }): string {
  return typeof opt === "string" ? opt : opt.text;
}

function answerRowSx(highlight: "correct" | "selected" | "none") {
  return {
    p: 1.5,
    mb: 1,
    borderRadius: 1,
    bgcolor: "background.paper",
    ...(highlight === "correct"
      ? { border: "1px solid", borderColor: "success.light" }
      : highlight === "selected"
        ? { border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }
        : {}),
  } as const;
}

function compareRowBg(ok: boolean, audience: ResultAudience): string {
  if (ok) {
    return "success.light";
  }
  return audience === "student" ? "action.hover" : "grey.100";
}

interface QuestionResultDisplayProps {
  question: ResultQuestion;
  /** student = exam result page; grader = teacher grading UI */
  audience?: ResultAudience;
}

export function QuestionResultDisplay({
  question,
  audience = "student",
}: QuestionResultDisplayProps) {
  const kind = getQuestionTypeKind(question.type);
  const norm = normalizeQuestion(question as unknown as Record<string, unknown>);
  const options = question.options ?? [];
  const answerLabel = participantAnswerLabel(audience);

  if (kind === "options_single" || question.type === "true_false") {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          گزینه‌ها:
        </Typography>
        {options.map((option, optIndex) => {
          const isCorrect = Array.isArray(question.correct_answer)
            ? question.correct_answer.includes(optIndex)
            : question.correct_answer === optIndex;
          const isSelected = question.your_answer === optIndex;
          const highlight = isCorrect ? "correct" : isSelected ? "selected" : "none";
          return (
            <Box key={optIndex} sx={answerRowSx(highlight)}>
              <Stack direction="row" alignItems="flex-start" spacing={1} flexWrap="wrap" useFlexGap>
                {isSelected ? (
                  <RadioButtonCheckedIcon
                    color={isCorrect ? "success" : "disabled"}
                    sx={{ mt: 0.25, ...(!isCorrect ? { color: "text.secondary" } : {}) }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ mt: 0.25, color: "text.disabled" }} />
                )}
                <RichLabel
                  html={optionLabel(option)}
                  fontSize="1rem"
                  block={false}
                  sx={{
                    flex: "1 1 200px",
                    minWidth: 0,
                    fontWeight: isCorrect ? "bold" : "normal",
                  }}
                />
                {isCorrect && (
                  <Chip label="پاسخ صحیح" color="success" size="small" variant="outlined" />
                )}
                {isSelected && !isCorrect && (
                  <Chip
                    label={participantAnswerChipLabel(audience, false)}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    );
  }

  if (kind === "options_multiple") {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          گزینه‌ها:
        </Typography>
        {options.map((option, optIndex) => {
          const correctAnswers = Array.isArray(question.correct_answer)
            ? question.correct_answer
            : [question.correct_answer];
          const selectedAnswers = Array.isArray(question.your_answer)
            ? question.your_answer
            : question.your_answer != null
              ? [question.your_answer]
              : [];
          const isCorrect = correctAnswers.includes(optIndex);
          const isSelected = selectedAnswers.includes(optIndex);
          const highlight = isCorrect ? "correct" : isSelected ? "selected" : "none";
          return (
            <Box key={optIndex} sx={answerRowSx(highlight)}>
              <Stack direction="row" alignItems="flex-start" spacing={1} flexWrap="wrap" useFlexGap>
                <RichLabel html={optionLabel(option)} fontSize="1rem" block={false} sx={{ flex: 1 }} />
                {isCorrect && (
                  <Chip label="پاسخ صحیح" color="success" size="small" variant="outlined" />
                )}
                {isSelected && (
                  <Chip
                    label={participantAnswerChipLabel(audience, !!isCorrect)}
                    color={isCorrect ? "success" : "default"}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    );
  }

  if (kind === "ordering" && norm.items.length > 0) {
    const yourOrder = Array.isArray(question.your_answer) ? question.your_answer : [];
    const correctOrder = norm.correct_order;
    const orderCaption =
      audience === "grader" ? "ترتیب دانش‌آموز / ترتیب صحیح:" : "ترتیب شما / ترتیب صحیح:";
    return (
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {orderCaption}
        </Typography>
        {correctOrder.map((idx, i) => {
          const yours = yourOrder[i];
          const ok = yours === idx;
          return (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: compareRowBg(ok, audience),
                border: "1px solid",
                borderColor: ok ? "success.light" : "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {i + 1}. {ok ? "مطابق پاسخ صحیح" : "متفاوت از پاسخ صحیح"}
              </Typography>
              <RichLabel html={optionText(norm.items[yours ?? idx])} fontSize="0.9rem" />
            </Box>
          );
        })}
      </Stack>
    );
  }

  if (kind === "matching" && norm.left_items.length > 0) {
    const yourMatches = Array.isArray(question.your_answer) ? question.your_answer : [];
    return (
      <Stack spacing={1}>
        {norm.matches.map((m, i) => {
          const rights =
            m.right_indices ?? (m.right_index != null ? [m.right_index] : []);
          const yours = yourMatches[i] as { right_index?: number; right_indices?: number[] } | undefined;
          const yourRights =
            yours?.right_indices ?? (yours?.right_index != null ? [yours.right_index] : []);
          const ok =
            JSON.stringify([...rights].sort()) === JSON.stringify([...yourRights].sort());
          return (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: compareRowBg(ok, audience),
                border: "1px solid",
                borderColor: ok ? "success.light" : "divider",
              }}
            >
              <RichLabel html={optionText(norm.left_items[m.left_index])} fontSize="0.9rem" />
              <Typography variant="caption" display="block" color="text.secondary">
                {answerLabel}:{" "}
                {yourRights.map((ri) => optionText(norm.right_items[ri])).join("، ") || "—"}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    );
  }

  if (kind === "blanks" && norm.blanks.length > 0) {
    const yourAnswers = Array.isArray(question.your_answer)
      ? question.your_answer.map(String)
      : [];
    return (
      <Stack spacing={1}>
        {norm.blanks.map((b, i) => {
          const expected =
            b.correct_answers ?? (b.correct_answer ? [b.correct_answer] : []);
          const manual = b.grading === "manual" || expected.length === 0;
          const yours = yourAnswers[i] ?? "";
          const ok =
            !manual &&
            expected.some((e) => e.trim().toLowerCase() === yours.trim().toLowerCase());
          return (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: manual ? "grey.50" : compareRowBg(ok, audience),
                border: "1px solid",
                borderColor: manual ? "divider" : ok ? "success.light" : "divider",
              }}
            >
              <Typography variant="body2">
                جای خالی {i + 1}: {yours || "—"}
                {manual
                  ? " (در حال بررسی)"
                  : audience === "grader"
                    ? ` — پاسخ صحیح: ${expected.join(" / ")}`
                    : ""}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    );
  }

  if (kind === "text" && question.type === "short_answer") {
    const expected =
      norm.correct_answers.length > 0
        ? norm.correct_answers
        : typeof question.correct_answer === "string"
          ? [question.correct_answer]
          : [];
    const yours = String(question.your_answer ?? "");
    const manual = expected.length === 0;
    const ok =
      !manual &&
      expected.some((e) => e.trim().toLowerCase() === yours.trim().toLowerCase());
    return (
      <Stack spacing={1.5}>
        <Box
          sx={{
            ...answerRowSx(ok ? "correct" : "selected"),
            p: { xs: 1.5, md: 2 },
            overflow: "visible",
            maxHeight: "none",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {answerLabel}:
          </Typography>
          {yours ? (
            <RichLabel html={yours} fontSize="1rem" compact={false} fullContent />
          ) : (
            <Typography variant="body1">پاسخی داده نشده</Typography>
          )}
          {manual && (
            <Alert severity="info" sx={{ mt: 1 }}>
              این پاسخ توسط معلم بررسی می‌شود
            </Alert>
          )}
        </Box>
        {audience === "grader" && !manual && expected.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              پاسخ‌های قابل قبول:
            </Typography>
            <Stack spacing={0.75}>
              {expected.map((ans, i) => (
                <Box key={i} sx={{ ...answerRowSx("correct"), p: 1 }}>
                  <Typography variant="body2">{ans}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    );
  }

  const isPendingGrading = question.is_pending_grading;
  const bgColor = isPendingGrading
    ? "grey.50"
    : question.is_correct
      ? "success.light"
      : "action.hover";

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {answerLabel}:
      </Typography>
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          bgcolor: bgColor,
          borderRadius: 1,
          border: "1px solid",
          borderColor: question.is_correct ? "success.light" : "divider",
          overflow: "visible",
          maxHeight: "none",
        }}
      >
        {question.your_answer != null && question.your_answer !== "" ? (
          <RichLabel
            html={String(question.your_answer)}
            fontSize="1rem"
            compact={false}
            fullContent
          />
        ) : (
          <Typography variant="body1">پاسخی داده نشده</Typography>
        )}
      </Box>
      {isPendingGrading && (
        <Alert severity="info" sx={{ mt: 1 }}>
          {audience === "grader"
            ? "این سوال هنوز نمره‌دهی نشده است."
            : "این بخش پس از بررسی معلم تکمیل می‌شود."}
        </Alert>
      )}
      {!isPendingGrading && question.is_correct && audience === "student" && (
        <Alert severity="success" sx={{ mt: 1 }} variant="outlined">
          آفرین، پاسخ درست بود.
        </Alert>
      )}
    </Box>
  );
}
