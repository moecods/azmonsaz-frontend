"use client";

import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { isQuestionAnswered } from "./is-question-answered";
import { takeExamColors, takeExamPageSx } from "./take-exam-styles";

interface TakeExamNavigatorProps {
  questions: { id: number }[];
  currentIndex: number;
  answers: Record<number, unknown>;
  onSelect: (index: number) => void;
}

export function TakeExamNavigator({
  questions,
  currentIndex,
  answers,
  onSelect,
}: TakeExamNavigatorProps) {
  return (
    <Card sx={takeExamPageSx.card}>
      <CardContent sx={{ p: { xs: 1.25, sm: 2 } }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          فهرست سوالات
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
          <LegendDot color="primary.main" label="فعلی" />
          <LegendDot color="success.main" label="پاسخ‌داده" />
          <LegendDot color="action.disabled" label="بی‌پاسخ" />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
            gap: 1,
            maxHeight: { md: 320 },
            overflow: "auto",
            pr: 0.5,
          }}
        >
          {questions.map((q, index) => {
            const isCurrent = index === currentIndex;
            const answered = isQuestionAnswered(answers[q.id]);
            return (
              <Button
                key={q.id}
                variant={isCurrent ? "contained" : "outlined"}
                size="small"
                onClick={() => onSelect(index)}
                aria-label={`رفتن به سوال ${index + 1}${answered ? " — پاسخ داده شده" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  p: 0,
                  fontWeight: 700,
                  borderRadius: 2,
                  ...(answered &&
                    !isCurrent && {
                      borderColor: "success.light",
                      bgcolor: takeExamColors.successSoft,
                      color: "success.dark",
                      "&:hover": {
                        bgcolor: "rgba(22, 163, 74, 0.16)",
                        borderColor: "success.main",
                      },
                    }),
                }}
              >
                {index + 1}
              </Button>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
