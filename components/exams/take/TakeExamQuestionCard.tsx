"use client";

import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import QuestionView from "@/components/questions/QuestionView";
import { takeExamPageSx } from "./take-exam-styles";

interface TakeExamQuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  points?: number;
  payload: Record<string, unknown>;
  answerValue: unknown;
  onAnswerChange: (value: unknown) => void;
  isSaving: boolean;
}

export function TakeExamQuestionCard({
  questionNumber,
  totalQuestions,
  points,
  payload,
  answerValue,
  onAnswerChange,
  isSaving,
}: TakeExamQuestionCardProps) {
  return (
    <Card sx={takeExamPageSx.card}>
      <CardContent sx={{ p: { xs: 1.25, sm: 3.5 }, "&:last-child": { pb: { xs: 1.25, sm: 3.5 } } }}>
        <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={1}
          >
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight={700}>
                سوال {questionNumber.toLocaleString("fa-IR")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                از {totalQuestions.toLocaleString("fa-IR")} سوال
                {points != null ? ` · ${points} نمره` : ""}
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={isSaving ? <CloudSyncOutlinedIcon /> : <CloudDoneOutlinedIcon />}
              label={isSaving ? "در حال ذخیره..." : "ذخیره خودکار"}
              color={isSaving ? "default" : "success"}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Stack>

          <Box
            sx={{
              p: { xs: 1.25, sm: 2.5 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <QuestionView
              mode="take"
              source={payload}
              answerValue={answerValue}
              onAnswerChange={onAnswerChange}
              options={{ showStemMeta: false, compactStem: false }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
