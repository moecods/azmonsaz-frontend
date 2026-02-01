"use client";

import { Box, Stack, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionManagement } from '@/hooks';
import { QuestionFilters, QuestionTable, QuestionFormDialog } from '@/components/questions';
import Breadcrumb from '@/components/Breadcrumb';

export default function QuestionsPage() {
  const {
    // State
    open,
    editingQuestion,
    filters,
    questions,
    categories,
    pagination,
    allTags,
    isLoading,
    isSubmitting,

    // Form
    control,
    handleSubmit,
    errors,
    questionType,
    options,
    watch,

    // Handlers
    updateFilter,
    handleOpenCreate,
    handleOpenEdit,
    handleClose,
    handleAddOption,
    handleRemoveOption,
    handleToggleCorrect,
    handleTypeChange,
    onSubmit,
    handleDelete,
  } = useQuestionManagement();

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'بانک سوالات' }]} />
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">بانک سوالات</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
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

        {/* Create/Edit Dialog */}
        <QuestionFormDialog
          open={open}
          editingQuestion={editingQuestion}
          control={control}
          errors={errors}
          questionType={questionType}
          options={options || []}
          allTags={allTags}
          isSubmitting={isSubmitting}
          onClose={handleClose}
          onSubmit={handleSubmit(onSubmit)}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
          onToggleCorrect={handleToggleCorrect}
          onTypeChange={handleTypeChange}
        />
      </Stack>
    </Box>
  );
}
