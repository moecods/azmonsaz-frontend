"use client";

import { useRouter } from 'next/navigation';
import {Stack, Typography, Button, IconButton, useMediaQuery, useTheme} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuestionManagement } from '@/hooks';
import { useQuestionBankViewMode } from '@/hooks/useQuestionBankViewMode';
import { QuestionFilters, QuestionList } from '@/components/questions';
import { QuestionBankViewToggle } from '@/components/questions/QuestionBankViewToggle';
import Breadcrumb from '@/components/Breadcrumb';
import ShellContentLoader from '@/components/layout/ShellContentLoader';
import {useState} from "react";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function QuestionsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { viewMode, setViewMode, hydrated } = useQuestionBankViewMode();

  const {
    filters,
    questions,
    categories,
    totalCount,
    loadedCount,
    allTags,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    isError,
    error,
    refetch,
    updateFilter,
    handleOpenEdit,
    handleDelete,
  } = useQuestionManagement();

  return (
    <ShellContentLoader loading={isLoading}>
    <Stack spacing={3}>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'بانک سوالات' }]} />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">بانک سوالات</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {hydrated && (
            <QuestionBankViewToggle value={viewMode} onChange={setViewMode} />
          )}
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

      {totalCount > 0 && (
        <Typography variant="caption" color="text.secondary">
          {loadedCount.toLocaleString("fa-IR")} از{" "}
          {totalCount.toLocaleString("fa-IR")} سوال
          {hasNextPage ? " — با اسکرول بیشتر بارگذاری می‌شود" : ""}
        </Typography>
      )}

      <QuestionList
        questions={questions}
        isInitialLoading={isLoading}
        isRefetching={isRefetching}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        viewMode={viewMode}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={loadMore}
        loadedCount={loadedCount}
        totalCount={totalCount}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    </Stack>
    </ShellContentLoader>
  );
}
