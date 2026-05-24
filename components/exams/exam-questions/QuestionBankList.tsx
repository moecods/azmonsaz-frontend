"use client";

import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import { QuestionBankItemDisplay } from "@/components/questions/QuestionBankItemDisplay";
import { QuestionBankCardMeta } from "@/components/exams/exam-questions/QuestionBankCardMeta";
import { InfiniteScrollSentinel } from "@/components/shared/InfiniteScrollSentinel";
import {
  QuestionBankCard,
  QuestionBankEmptyState,
} from "@/components/questions/question-bank";
import type { QuestionBankViewMode } from "@/lib/question-bank-view";
import type { Question } from "@/types";

interface QuestionBankListProps {
  questions: Question[];
  isInitialLoading: boolean;
  isRefetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  viewMode?: QuestionBankViewMode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  inExamQuestionIds: ReadonlySet<number>;
  inCart: (questionId: number) => boolean;
  onToggleCart: (question: Question) => void;
  disabled?: boolean;
  loadedCount?: number;
  totalCount?: number;
}

export function QuestionBankList({
  questions,
  isInitialLoading,
  isRefetching = false,
  isError = false,
  errorMessage,
  onRetry,
  viewMode = "bank",
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  inExamQuestionIds,
  inCart,
  onToggleCart,
  disabled = false,
  loadedCount,
  totalCount,
}: QuestionBankListProps) {
  if (isInitialLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8} spacing={2}>
        <CircularProgress aria-label="در حال بارگذاری سوالات" />
        <Typography variant="body2" color="text.secondary">
          در حال بارگذاری سوالات…
        </Typography>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          onRetry ? (
            <Typography
              component="button"
              variant="body2"
              onClick={onRetry}
              sx={{ border: 0, bgcolor: "transparent", cursor: "pointer", font: "inherit" }}
            >
              تلاش مجدد
            </Typography>
          ) : undefined
        }
      >
        {errorMessage || "بارگذاری سوالات ناموفق بود."}
      </Alert>
    );
  }

  if (questions.length === 0) {
    return (
      <QuestionBankEmptyState
        title="سوالی با این فیلترها نیست"
        description="عبارت جستجو یا دسته‌بندی را تغییر دهید. سوالات قبلاً اضافه‌شده با برچسب «در آزمون» مشخص می‌شوند."
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {questions.map((question) => {
        const questionType = question.type || "multiple_choice";
        const alreadyInExam = inExamQuestionIds.has(question.id);
        const inCartNow = inCart(question.id);

        return (
          <QuestionBankCard
            key={question.id}
            questionType={questionType}
            selected={inCartNow && !alreadyInExam}
            muted={alreadyInExam}
            meta={
              <QuestionBankCardMeta
                question={question}
                viewMode={viewMode}
                alreadyInExam={alreadyInExam}
              />
            }
            actions={
              alreadyInExam ? (
                <Tooltip title="این سوال قبلاً در آزمون است">
                  <span>
                    <IconButton
                      size="medium"
                      disabled
                      aria-label="در آزمون"
                      sx={{
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
                      }}
                    >
                      <BlockIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : (
                <Tooltip title={inCartNow ? "حذف از سبد" : "افزودن به سبد"}>
                  <IconButton
                    size="medium"
                    color={inCartNow ? "primary" : "default"}
                    aria-label={inCartNow ? "حذف از سبد" : "افزودن به سبد"}
                    aria-pressed={inCartNow}
                    disabled={disabled}
                    onClick={() => onToggleCart(question)}
                    sx={{
                      minWidth: 44,
                      minHeight: 44,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "background.paper", boxShadow: 2 },
                    }}
                  >
                    {inCartNow ? <CheckCircleIcon /> : <AddShoppingCartIcon />}
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <QuestionBankItemDisplay
              source={question}
              viewMode={viewMode}
              compact
              suppressStemMeta
            />
          </QuestionBankCard>
        );
      })}

      {onLoadMore && (
        <Box sx={{ pt: 1 }}>
          <InfiniteScrollSentinel
            hasMore={hasNextPage}
            isFetchingMore={isFetchingNextPage}
            onLoadMore={onLoadMore}
            loadedCount={loadedCount}
            totalCount={totalCount}
          />
        </Box>
      )}
    </Stack>
  );
}
