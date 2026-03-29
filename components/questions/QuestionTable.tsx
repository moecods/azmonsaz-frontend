"use client";

import React from 'react';
import { Card, CardContent, Box, Pagination, Stack, Chip, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table, TableColumn } from '@/components/ui';
import { Question } from '@/types';
import { Skeleton } from '@/components/ui';

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

export function QuestionTable({
  questions,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}: QuestionTableProps) {
  const columns: TableColumn<Question>[] = [
    {
      id: 'text',
      label: 'سوال',
      width: "100px",
      render: (value) => (
        <Typography variant="body2" sx={{ maxWidth: 300 }}>
          {value.length > 100 ? `${value.substring(0, 100)}...` : value}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'نوع',
      render: (value) => {
        const typeLabels: Record<string, string> = {
          'multiple_choice': 'چند گزینه‌ای',
          'true_false': 'صحیح/غلط',
          'multiple_select': 'چند گزینه‌ای (چند پاسخ)',
          'essay': 'تشریحی',
        };
        return <Chip label={typeLabels[value] || value} size="small" color="primary" />;
      },
    },
    {
      id: 'category',
      label: 'دسته‌بندی',
      render: (_, row) => row.category?.name || '-',
    },
    {
      id: 'difficulty',
      label: 'سطح دشواری',
      render: (value) => {
        const difficultyLabels: Record<string, string> = {
          'easy': 'آسان',
          'medium': 'متوسط',
          'hard': 'سخت',
        };
        const color =
          value === 'easy' ? 'success' : value === 'medium' ? 'warning' : 'error';
        return <Chip label={difficultyLabels[value] || value} size="small" color={color} />;
      },
    },
    {
      id: 'tags',
      label: 'برچسب‌ها',
      render: (_, row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {row.tags.slice(0, 2).map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
          {row.tags.length > 2 && (
            <Chip label={`+${row.tags.length - 2}`} size="small" />
          )}
        </Stack>
      ),
    },
    {
      id: 'actions',
      label: 'عملیات',
      align: 'right',
      render: (_, row) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => onEdit(row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Table
          columns={columns}
          data={questions}
          loading={loading}
          emptyMessage="هیچ سوالی یافت نشد"
          pagination={!!pagination}
          page={pagination?.current_page ? pagination.current_page - 1 : 0}
          rowsPerPage={pagination?.per_page || 10}
          totalRows={pagination?.total}
          onPageChange={(page) => onPageChange(page + 1)}
        />
      </CardContent>
    </Card>
  );
}

