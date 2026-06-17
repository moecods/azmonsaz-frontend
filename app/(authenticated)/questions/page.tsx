"use client";

import { useRouter } from "next/navigation";
import { Button, Chip, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useQuestionManagement } from "@/hooks";
import { useQuestionBankViewMode } from "@/hooks/useQuestionBankViewMode";
import { useConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { QuestionFilters, QuestionList } from "@/components/questions";
import { QuestionBankViewToggle } from "@/components/questions/QuestionBankViewToggle";
import Breadcrumb from "@/components/Breadcrumb";
import ShellContentLoader from "@/components/layout/ShellContentLoader";
import {
  QuestionBankLayout,
  QuestionBankPageHeader,
  QuestionBankToolbar,
} from "@/components/questions/question-bank";
import { useMainProgress } from "@/components/layout/MainProgressProvider";

export default function QuestionsPage() {
  const router = useRouter();
  const { viewMode, setViewMode, hydrated } = useQuestionBankViewMode();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

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

  const handleDeleteWithConfirm = async (id: number) => {
    const ok = await confirm({
      title: "حذف سوال",
      message: "آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟",
      confirmLabel: "حذف",
      confirmColor: "error",
    });
    if (ok) handleDelete(id);
  };

  useMainProgress(
    !isLoading && (isRefetching || isFetchingNextPage) ? { active: true } : null
  );

  return (
    <ShellContentLoader loading={isLoading}>
      <Stack spacing={2}>
        <Breadcrumb items={[{ label: "بانک سوالات" }]} />

        <QuestionBankLayout
          header={
            <QuestionBankPageHeader
              title="بانک سوالات"
              subtitle="جستجو، فیلتر و مدیریت سوالات برای استفاده در آزمون‌ها"
              icon={<MenuBookIcon />}
              stats={
                totalCount > 0 ? (
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={`${totalCount.toLocaleString("fa-IR")} سوال`}
                  />
                ) : undefined
              }
              actions={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/questions/create")}
                >
                  افزودن سوال
                </Button>
              }
            />
          }
          filters={
            <QuestionFilters
              filters={filters}
              categories={categories}
              allTags={allTags}
              onFilterChange={updateFilter}
              loadedCount={loadedCount}
              totalCount={totalCount}
              isRefetching={isRefetching}
            />
          }
          toolbar={
            hydrated ? (
              <QuestionBankToolbar
                hint="با «نمایش بانک» پاسخ کلید را ببینید؛ با «نمایش دانش‌آموز» همان چیزی که در آزمون دیده می‌شود."
                viewToggle={
                  <QuestionBankViewToggle value={viewMode} onChange={setViewMode} size="small" />
                }
              />
            ) : undefined
          }
        >
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
            onDelete={handleDeleteWithConfirm}
          />
        </QuestionBankLayout>
      </Stack>
      {confirmDialog}
    </ShellContentLoader>
  );
}
