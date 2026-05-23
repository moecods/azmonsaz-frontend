"use client";

import React, { useCallback } from 'react';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
} from '@mui/material';
import { questionTypeBorderSx } from '@/lib/question-types/type-appearance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Question } from '@/types';
import QuestionDisplay from '@/components/questions/QuestionDisplay';

const DEFAULT_PAGE_SIZE = 10;

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

const QuestionCard = React.memo(function QuestionCard({
  question,
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
              <QuestionDisplay source={question} mode="bank" />
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
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}) {
  const handleEdit = useCallback((question: Question) => onEdit(question), [onEdit]);
  const handleDelete = useCallback((id: number) => onDelete(id), [onDelete]);

  // MUI's TablePagination is 0-based; the API + hook are 1-based.
  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => onPageChange(newPage + 1),
    [onPageChange],
  );

  const currentPage = pagination?.current_page ? pagination.current_page - 1 : 0;
  const rowsPerPage = pagination?.per_page || DEFAULT_PAGE_SIZE;

  if (loading) {
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
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      {pagination && pagination.total > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TablePagination
            component="div"
            count={pagination.total}
            page={currentPage}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            // Per-page is fixed by the hook; hide the selector for clarity.
            rowsPerPageOptions={[rowsPerPage]}
            labelRowsPerPage=""
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} از ${count}`}
          />
        </Box>
      )}
    </Stack>
  );
});

QuestionList.displayName = 'QuestionList';

export default QuestionList;
