"use client";

import { Box, Stack, Typography } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { normalizeQuestion, optionText } from "@/lib/question-types/normalize-question";
import OptionsList from "./primitives/OptionsList";

interface QuestionAnswerKeyProps {
  source: Record<string, unknown>;
}

/** Read-only correct-answer summary (bank, manage, print). */
export default function QuestionAnswerKey({ source }: QuestionAnswerKeyProps) {
  const q = normalizeQuestion(source);
  const { type, kind } = q;

  if (
    (kind === "options_single" || kind === "options_multiple" || type === "true_false") &&
    q.options.length > 0
  ) {
    return (
      <OptionsList
        questionType={type}
        options={q.options}
        correctAnswer={q.correct_answer}
        displaySettings={q.display_settings}
        mode="authoring"
      />
    );
  }

  if (kind === "text" && type === "short_answer") {
    const answers =
      q.correct_answers.length > 0
        ? q.correct_answers
        : typeof q.correct_answer === "string" && q.correct_answer.trim()
          ? [q.correct_answer]
          : [];
    if (answers.length === 0) {
      return (
        <Typography variant="caption" color="text.secondary">
          تصحیح دستی — بدون پاسخ کلیدی
        </Typography>
      );
    }
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          پاسخ‌های قابل قبول:
        </Typography>
        <Stack spacing={0.75}>
          {answers.map((a, i) => (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "success.main",
              }}
            >
              <Typography variant="body2">{a}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  if (kind === "text" && type === "essay") {
    return (
      <Typography variant="caption" color="text.secondary">
        سوال تشریحی — تصحیح دستی
      </Typography>
    );
  }

  if (kind === "ordering" && q.items.length > 0) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          ترتیب صحیح:
        </Typography>
        <Stack spacing={0.5}>
          {q.correct_order.map((orderIdx, i) => {
            const item = q.items[orderIdx];
            return (
              <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Typography component="span" variant="body2" sx={{ minWidth: 24 }}>
                  {i + 1}.
                </Typography>
                <RichLabel html={item != null ? optionText(item) : `مورد ${orderIdx + 1}`} fontSize="0.875rem" block={false} />
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  }

  if (kind === "matching" && q.left_items.length > 0) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          تطبیق صحیح:
        </Typography>
        <Stack spacing={0.5}>
          {q.matches.map((m, i) => {
            const rights =
              m.right_indices ??
              (m.right_index != null ? [m.right_index] : []);
            return (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                <RichLabel html={optionText(q.left_items[m.left_index] ?? "")} fontSize="0.875rem" block={false} />
                <Typography component="span" variant="body2">
                  ←
                </Typography>
                {rights.map((ri, j) => (
                  <RichLabel key={j} html={optionText(q.right_items[ri] ?? "")} fontSize="0.875rem" block={false} />
                ))}
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  }

  if (kind === "blanks" && q.blanks.length > 0) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          پاسخ جای خالی‌ها:
        </Typography>
        <Stack spacing={0.5}>
          {q.blanks.map((b, i) => {
            const answers =
              b.correct_answers ??
              (b.correct_answer ? [b.correct_answer] : []);
            const manual = b.grading === "manual" || answers.length === 0;
            return (
              <Typography key={i} variant="body2">
                {i + 1}. {manual ? "تصحیح دستی" : answers.join(" / ")}
              </Typography>
            );
          })}
        </Stack>
      </Box>
    );
  }

  return null;
}
