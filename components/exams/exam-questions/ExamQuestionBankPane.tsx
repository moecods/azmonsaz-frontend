"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import QuestionBankDrawer from "@/components/questions/QuestionBankDrawer";
import CreateCustomQuestion from "@/components/questions/CreateCustomQuestion";
import type { Question } from "@/types";

interface ExamQuestionBankPaneProps {
  examId?: number;
  isMobile: boolean;
  defaultPoints: number;
  bankDrawerOpen: boolean;
  onOpenBank: () => void;
  onCloseBank: () => void;
  onAddQuestion: (question: Question) => void;
  closeOnAdd: boolean;
}

export function ExamQuestionBankPane({
  examId,
  isMobile,
  defaultPoints,
  bankDrawerOpen,
  onOpenBank,
  onCloseBank,
  onAddQuestion,
  closeOnAdd,
}: ExamQuestionBankPaneProps) {
  return (
    <Paper
      sx={{
        p: isMobile ? 3 : 0,
        height: isMobile ? "fit-content" : "calc(100vh - 140px)",
        position: isMobile ? "relative" : "sticky",
        top: isMobile ? 0 : 24,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            افزودن سوال
          </Typography>
          <Typography variant="body2" color="text.secondary">
            از بانک سوالات انتخاب کنید یا سوال جدید بسازید. با باز شدن پنل بانک، سوالات با جزئیات و آمار نمایش داده می‌شوند.
          </Typography>
        </Box>
        {!isMobile ? (
          <QuestionBankDrawer
            variant="embedded"
            onAddQuestion={onAddQuestion}
            closeOnAdd={false}
            defaultPoints={defaultPoints}
          />
        ) : (
          <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenBank} fullWidth>
              افزودن از بانک سوالات
            </Button>
            <QuestionBankDrawer
              open={bankDrawerOpen}
              onClose={onCloseBank}
              onAddQuestion={onAddQuestion}
              closeOnAdd={closeOnAdd}
              defaultPoints={defaultPoints}
            />
          </>
        )}
        <CreateCustomQuestion examId={examId} />
      </Stack>
    </Paper>
  );
}
