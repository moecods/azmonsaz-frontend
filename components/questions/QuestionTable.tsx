"use client";

import React, { useMemo, useCallback } from 'react';

import { Card, CardContent, Stack, Chip, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table, TableColumn } from '@/components/ui';
import { Question } from '@/types';

const TEXT_TRUNCATE_LIMIT = 100;
const MAX_VISIBLE_TAGS = 2;
const DEFAULT_PAGE_SIZE = 10;

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'چند گزینه‌ای',
  true_false: 'صحیح/غلط',
  multiple_select: 'چند گزینه‌ای (چند پاسخ)',
  essay: 'تشریحی',
  ordering: 'ترتیبی',
  matching: 'تطبیقی',
  fill_in_the_blank: 'جای خالی',
  short_answer: 'پاسخ کوتاه',
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  easy: { label: 'آسان', color: 'success' },
  medium: { label: 'متوسط', color: 'warning' },
  hard: { label: 'سخت', color: 'error' },
};

const TagsRenderer: React.FC<{ tags: string[] }> = React.memo(({ tags }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap">
    {tags.slice(0, MAX_VISIBLE_TAGS).map((tag, index) => (
      <Chip key={index} label={tag} size="small" variant="outlined" />
    ))}
    {tags.length > MAX_VISIBLE_TAGS && (
      <Chip label={`+${tags.length - MAX_VISIBLE_TAGS}`} size="small" />
    )}
  </Stack>
));

TagsRenderer.displayName = 'TagsRenderer';

const DifficultyChip: React.FC<{ difficulty: string }> = React.memo(({ difficulty }) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  return (
    <Chip
      label={config?.label || difficulty}
      size="small"
      color={config?.color || 'default'}
    />
  );
});

DifficultyChip.displayName = 'DifficultyChip';

interface QuestionTableProps {
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

export const QuestionTable: React.FC<QuestionTableProps> = React.memo(({
 questions,
 loading,
 pagination,
 onPageChange,
 onEdit,
 onDelete,
}) => {
  const handleEdit = useCallback(
    (question: Question) => onEdit(question),
    [onEdit]
  );

  const handleDelete = useCallback(
    (id: number) => onDelete(id),
    [onDelete]
  );

  const handlePageChange = useCallback(
    (page: number) => onPageChange(page + 1),
    [onPageChange]
  );

  const columns = useMemo<TableColumn<Question>[]>(
    () => [
    {
      id: 'text',
      label: 'سوال',
      width: '100px',
      render: (value: string) => (
        <Typography
          variant="body2"
          sx={{ maxWidth: 300 }}
          title={value}
        >
          {value.length > TEXT_TRUNCATE_LIMIT
            ? `${value.substring(0, TEXT_TRUNCATE_LIMIT)}...`
            : value}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'نوع',
      render: (value: string) => (
        <Chip
          label={QUESTION_TYPE_LABELS[value] || value}
          size="small"
          color="primary"
        />
      ),
    },
    {
      id: 'category',
      label: 'دسته‌بندی',
      render: (_, row) => row.category?.name || '-',
    },
    {
      id: 'difficulty',
      label: 'سطح دشواری',
      render: (value: string) => <DifficultyChip difficulty={value} />,
    },
    {
      id: 'tags',
      label: 'برچسب‌ها',
      render: (_: unknown, row: Question) => (
        <TagsRenderer tags={row.tags} />
      ),
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (_: unknown, row: Question) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleEdit(row)}
            aria-label="ویرایش سوال"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(row.id)}
            aria-label="حذف سوال"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
      ],
      [handleEdit, handleDelete]
  );

  const currentPage = pagination?.current_page
    ? pagination.current_page - 1
    : 0;

  const rowsPerPage = pagination?.per_page || DEFAULT_PAGE_SIZE;

  return (
    <Card>
      <CardContent>
        <Table
          columns={columns}
          data={questions}
          loading={loading}
          emptyMessage="هیچ سوالی یافت نشد"
          pagination={!!pagination}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          totalRows={pagination?.total}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
});

QuestionTable.displayName = 'QuestionTable';