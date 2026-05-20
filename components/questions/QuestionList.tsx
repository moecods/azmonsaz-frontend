"use client";

import React, { useCallback } from 'react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Question } from '@/types';
import { RichLabel } from '@/components/editor';
import { QUESTION_TYPE_LABELS, DIFFICULTY_CONFIG } from '@/constants/question';
import { getQuestionTypeKind } from '@/lib/question-types';

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

function optionText(opt: unknown): string {
  if (typeof opt === 'string') return opt;
  if (opt && typeof opt === 'object' && 'text' in opt) {
    const value = (opt as { text?: unknown }).text;
    return typeof value === 'string' ? value : '';
  }
  return '';
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
  // The bank API returns extra fields per question type (items, blanks, etc.)
  // that aren't on the typed `Question` interface. Cast once for safe read access.
  const extras = question as unknown as Record<string, unknown>;

  const questionType = (question.type ?? 'multiple_choice') as string;
  const kind = getQuestionTypeKind(questionType);
  const difficulty = DIFFICULTY_CONFIG[question.difficulty];

  const options = Array.isArray(question.options) ? question.options : [];
  const correctAnswer = question.correct_answer ?? null;

  const isCorrectOption = (idx: number): boolean => {
    if (questionType === 'multiple_select' && Array.isArray(correctAnswer)) {
      return correctAnswer.includes(idx);
    }
    if (questionType === 'true_false' || questionType === 'multiple_choice') {
      return (
        correctAnswer === idx ||
        (Array.isArray(correctAnswer) && correctAnswer.includes(idx))
      );
    }
    return false;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Chip
                  label={QUESTION_TYPE_LABELS[questionType] ?? questionType}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {difficulty && (
                  <Chip label={difficulty.label} size="small" color={difficulty.color} />
                )}
                {question.category?.name && (
                  <Chip label={question.category.name} size="small" variant="outlined" />
                )}
                {(question.tags ?? []).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
              <RichLabel
                html={question.text || ''}
                fontSize="1rem"
                sx={{ fontWeight: 500 }}
              />
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

          {(kind === 'options_single' || kind === 'options_multiple' || questionType === 'true_false') &&
            options.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  گزینه‌ها:
                </Typography>
                <Stack spacing={0.75}>
                  {options.map((opt, idx) => {
                    const isCorrect = isCorrectOption(idx);
                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: isCorrect ? 'success.light' : 'action.hover',
                          border: '1px solid',
                          borderColor: isCorrect ? 'success.main' : 'transparent',
                        }}
                      >
                        <Typography component="span" sx={{ fontWeight: 600, minWidth: 24 }}>
                          {String.fromCharCode(65 + idx)}.
                        </Typography>
                        <RichLabel
                          html={optionText(opt)}
                          fontSize="0.875rem"
                          block={false}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            fontWeight: isCorrect ? 600 : 400,
                          }}
                        />
                        {isCorrect && (
                          <Chip label="پاسخ صحیح" color="success" size="small" />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

          {kind === 'text' &&
            questionType === 'short_answer' &&
            correctAnswer != null &&
            String(correctAnswer).trim() !== '' && (
              <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  پاسخ صحیح:
                </Typography>
                <RichLabel html={String(correctAnswer)} fontSize="0.875rem" sx={{ fontWeight: 500 }} />
              </Box>
            )}

          {kind === 'text' && questionType === 'essay' && (
            <Typography variant="caption" color="text.secondary">
              سوال تشریحی — تصحیح دستی
            </Typography>
          )}

          {kind === 'ordering' && Array.isArray(extras.items) && (extras.items as unknown[]).length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                ترتیب صحیح:
              </Typography>
              <Stack spacing={0.5}>
                {((extras.correct_order as number[]) ?? []).map((orderIdx, i) => {
                  const items = (extras.items as Array<string | { text?: string }>) ?? [];
                  const item = items[orderIdx];
                  const itemHtml = item != null ? optionText(item) : `مورد ${orderIdx + 1}`;
                  return (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Typography component="span" variant="body2" sx={{ minWidth: 24 }}>
                        {i + 1}.
                      </Typography>
                      <RichLabel html={itemHtml} fontSize="0.875rem" />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {kind === 'matching' &&
            Array.isArray(extras.left_items) &&
            Array.isArray(extras.right_items) && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  تطبیق صحیح:
                </Typography>
                <Stack spacing={0.5}>
                  {((extras.matches as { left_index: number; right_index: number }[]) ??
                    (extras.left_items as unknown[]).map((_, i) => ({ left_index: i, right_index: 0 }))).map(
                    (m, i) => {
                      const leftItems = (extras.left_items as Array<string | { text?: string }>) ?? [];
                      const rightItems = (extras.right_items as Array<string | { text?: string }>) ?? [];
                      return (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <RichLabel html={optionText(leftItems[m.left_index] ?? '')} fontSize="0.875rem" />
                          <Typography component="span" variant="body2">
                            ←
                          </Typography>
                          <RichLabel html={optionText(rightItems[m.right_index] ?? '')} fontSize="0.875rem" />
                        </Box>
                      );
                    },
                  )}
                </Stack>
              </Box>
            )}

          {kind === 'blanks' && Array.isArray(extras.blanks) && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                پاسخ جای خالی‌ها:
              </Typography>
              <Stack spacing={0.5}>
                {((extras.blanks as { position: number; correct_answer: string }[]) ?? []).map((b, i) => (
                  <Typography key={i} variant="body2">
                    {i + 1}. {b.correct_answer || '—'}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
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
