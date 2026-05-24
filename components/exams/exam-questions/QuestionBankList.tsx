"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import { questionTypeBorderSx } from "@/lib/question-types/type-appearance";
import { QuestionBankItemDisplay } from "@/components/questions/QuestionBankItemDisplay";
import { QuestionBankCardMeta } from "@/components/exams/exam-questions/QuestionBankCardMeta";
import { InfiniteScrollSentinel } from "@/components/shared/InfiniteScrollSentinel";
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
      <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
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
      <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
        سوالی یافت نشد. فیلترها را تغییر دهید یا عبارت جستجو را ویرایش کنید.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {isRefetching && <LinearProgress aria-label="در حال به‌روزرسانی لیست" />}

      {questions.map((question) => {
        const questionType = question.type || "multiple_choice";
        const alreadyInExam = inExamQuestionIds.has(question.id);
        const inCartNow = inCart(question.id);

        return (
          <Card
            key={question.id}
            variant="outlined"
            sx={(t) => ({
              overflow: "visible",
              opacity: alreadyInExam ? 0.72 : 1,
              ...questionTypeBorderSx(t, questionType),
              ...(inCartNow && !alreadyInExam
                ? { bgcolor: "action.selected", borderColor: "primary.light" }
                : {}),
            })}
          >
            <CardContent
              sx={{
                position: "relative",
                "&:last-child": { pb: 2 },
                py: 1.5,
                pe: { xs: 7, sm: 2 },
                ps: { xs: 1.5, sm: 2 },
              }}
            >
              <QuestionBankCardMeta
                question={question}
                viewMode={viewMode}
                alreadyInExam={alreadyInExam}
              />
              <QuestionBankItemDisplay
                source={question}
                viewMode={viewMode}
                compact
                suppressStemMeta
              />

              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  insetInlineEnd: 8,
                  zIndex: 1,
                }}
              >
                {alreadyInExam ? (
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
                  <Tooltip title={inCartNow ? "حذف از سبد" : "افزودن به آزمون"}>
                    <IconButton
                      size="medium"
                      color={inCartNow ? "primary" : "default"}
                      aria-label={inCartNow ? "حذف از سبد" : "افزودن به آزمون"}
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
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {onLoadMore && (
        <InfiniteScrollSentinel
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={onLoadMore}
          loadedCount={loadedCount}
          totalCount={totalCount}
        />
      )}
    </Stack>
  );
}
