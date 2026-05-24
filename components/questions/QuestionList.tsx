"use client";

import React, { useCallback } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { InfiniteScrollSentinel } from "@/components/shared/InfiniteScrollSentinel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Question } from "@/types";
import type { QuestionBankViewMode } from "@/lib/question-bank-view";
import { QuestionBankItemDisplay } from "@/components/questions/QuestionBankItemDisplay";
import { QuestionBankCardMeta } from "@/components/exams/exam-questions/QuestionBankCardMeta";
import {
  QuestionBankCard,
  QuestionBankEmptyState,
} from "@/components/questions/question-bank";

interface QuestionListProps {
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
  loadedCount?: number;
  totalCount?: number;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

export const QuestionList: React.FC<QuestionListProps> = React.memo(function QuestionList({
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
  loadedCount,
  totalCount,
  onEdit,
  onDelete,
}) {
  const handleEdit = useCallback((question: Question) => onEdit(question), [onEdit]);
  const handleDelete = useCallback((id: number) => onDelete(id), [onDelete]);

  if (isInitialLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" py={8} spacing={2}>
        <CircularProgress />
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
        title="هنوز سوالی در بانک نیست"
        description="اولین سوال را بسازید یا فیلترها را تغییر دهید."
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {questions.map((question) => {
        const questionType = question.type || "multiple_choice";

        return (
          <QuestionBankCard
            key={question.id}
            questionType={questionType}
            meta={
              <QuestionBankCardMeta question={question} viewMode={viewMode} />
            }
            actions={
              <>
                <Tooltip title="ویرایش سوال">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(question)}
                    sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="حذف سوال">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(question.id)}
                    sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <QuestionBankItemDisplay source={question} viewMode={viewMode} compact suppressStemMeta />
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
});

QuestionList.displayName = "QuestionList";

export default QuestionList;
