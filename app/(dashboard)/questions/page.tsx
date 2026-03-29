"use client";

import { useRouter } from 'next/navigation';
import {Stack, Typography, Button, IconButton, useMediaQuery, useTheme} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionManagement } from '@/hooks';
import { QuestionFilters, QuestionTable } from '@/components/questions';
import Breadcrumb from '@/components/Breadcrumb';
import {useState} from "react";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function QuestionsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Stack direction="row" spacing={1}>
          {isMobile ? (
            <>
              <IconButton
                color={showFilters ? 'primary' : 'default'}
                onClick={() => setShowFilters(!showFilters)}
                title={showFilters ? 'مخفی کردن فیلتر' : 'نمایش فیلتر'}
              >
                {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
              </IconButton>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'مخفی کردن فیلتر' : 'نمایش فیلتر'}
              </Button>
            </>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/questions/create')}
          >
            افزودن سوال
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <QuestionFilters
        showFilters={showFilters}
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
