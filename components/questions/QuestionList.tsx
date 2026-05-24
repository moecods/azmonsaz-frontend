"use client";

import React, { useCallback } from 'react';

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
} from '@mui/material';
import { InfiniteScrollSentinel } from '@/components/shared/InfiniteScrollSentinel';
import { questionTypeBorderSx } from '@/lib/question-types/type-appearance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Question } from '@/types';
import type { QuestionBankViewMode } from '@/lib/question-bank-view';
import { QuestionBankItemDisplay } from '@/components/questions/QuestionBankItemDisplay';

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

interface QuestionCardProps {
  question: Question;
  viewMode: QuestionBankViewMode;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

const QuestionCard = React.memo(function QuestionCard({
  question,
  viewMode,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        ...questionTypeBorderSx(theme, question.type),
      })}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <QuestionBankItemDisplay source={question} viewMode={viewMode} />
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="ویرایش سوال">
                <IconButton size="small" color="primary" onClick={() => onEdit(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف سوال">
                <IconButton size="small" color="error" onClick={() => onDelete(question.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});

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
      <Card variant="outlined">
        <CardContent>
          <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              در حال بارگذاری سوالات…
            </Typography>
          </Stack>
        </CardContent>
      </Card>
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
      <Card variant="outlined">
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
            هیچ سوالی یافت نشد
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {isRefetching && <LinearProgress aria-label="در حال به‌روزرسانی لیست" />}

      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          viewMode={viewMode}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

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
});

QuestionList.displayName = 'QuestionList';

export default QuestionList;
