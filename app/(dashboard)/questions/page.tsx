"use client";

import { useRouter } from 'next/navigation';
import { Box, Stack, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionManagement } from '@/hooks';
import { QuestionFilters, QuestionTable } from '@/components/questions';
import Breadcrumb from '@/components/Breadcrumb';

export default function QuestionsPage() {
  const router = useRouter();
  const {
    filters,
    questions,
    categories,
    pagination,
    allTags,
    isLoading,
    updateFilter,
    handleOpenEdit,
    handleDelete,
  } = useQuestionManagement();

  return (
    <Stack spacing={3}>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'بانک سوالات' }]} />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">بانک سوالات</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/questions/create')}
        >
          افزودن سوال
        </Button>
      </Stack>

      {/* Filters */}
      <QuestionFilters
        filters={filters}
        categories={categories}
        allTags={allTags}
        onFilterChange={updateFilter}
      />

      {/* Questions Table */}
      <QuestionTable
        questions={questions}
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page) => updateFilter('page', page)}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    </Stack>
  );
}
