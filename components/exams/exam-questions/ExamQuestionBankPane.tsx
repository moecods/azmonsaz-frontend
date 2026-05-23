"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import QuestionBankDrawer from "@/components/questions/QuestionBankDrawer";
import CreateCustomQuestion from "@/components/questions/CreateCustomQuestion";
import type { ExamQuestion } from "@/types";

interface ExamQuestionBankPaneProps {
  examId?: number;
  defaultPoints: number;
  onAddQuestion: (question: ExamQuestion) => void;
}

/**
 * Question bank below the exam question list (stacked layout).
 */
export function ExamQuestionBankPane({
  examId,
  defaultPoints,
  onAddQuestion,
}: ExamQuestionBankPaneProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              افزودن سوال از بانک
            </Typography>
            <Typography variant="body2" color="text.secondary">
              سوال را از لیست زیر انتخاب کنید تا به آزمون اضافه شود.
            </Typography>
          </Box>

          <Box
            sx={{
              maxHeight: { xs: "55vh", md: "min(70vh, 640px)" },
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <QuestionBankDrawer
              variant="embedded"
              onAddQuestion={onAddQuestion}
              closeOnAdd={false}
              defaultPoints={defaultPoints}
            />
          </Box>

          <CreateCustomQuestion examId={examId} />
        </Stack>
      </CardContent>
    </Card>
  );
}
