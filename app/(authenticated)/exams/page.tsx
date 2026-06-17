"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  Chip,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PublishIcon from "@mui/icons-material/Publish";
import DraftsIcon from "@mui/icons-material/Drafts";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useExams } from "@/hooks/useExams";
import { useDebounce } from "@/hooks/useDebounce";
import Breadcrumb from "@/components/Breadcrumb";
import ProtectedRoute from "@/components/ProtectedRoute";
import ExamsCalendarView from "@/components/exams/ExamsCalendarView";
import { ExamCard } from "@/components/exams/list/ExamCard";
import { ExamsFiltersPanel } from "@/components/exams/list/ExamsFiltersPanel";
import { ExamsListToolbar, type ExamsViewMode } from "@/components/exams/list/ExamsListToolbar";
import {
  QuestionBankLayout,
  QuestionBankPageHeader,
  QuestionBankEmptyState,
} from "@/components/questions/question-bank";
import { useMainProgress } from "@/components/layout/MainProgressProvider";
import { AnimatedContent } from "@/components/feedback/AnimatedListBody";
import {
  computeExamsStats,
  sortExamsClient,
  type ExamsListFilters,
} from "@/lib/exams-list-utils";
import type { ExamListItem } from "@/services/exams/ExamService";

const DEFAULT_FILTERS: ExamsListFilters = {
  search: "",
  status: "all",
  type: "all",
  sort: "newest",
};

function ExamListSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          xl: "repeat(3, 1fr)",
        },
        gap: 2,
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
          <Skeleton variant="rounded" width="45%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={28} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rounded" height={6} sx={{ mt: 2 }} />
        </Card>
      ))}
    </Box>
  );
}

export default function ExamsPage() {
  return (
    <ProtectedRoute requiredPermission="view exams">
      <ExamsPageContent />
    </ProtectedRoute>
  );
}

function ExamsPageContent() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExamsListFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ExamsViewMode>("list");

  const debouncedSearch = useDebounce(filters.search, 400);

  const { data, isLoading, isFetching, error } = useExams({
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
    search: debouncedSearch || undefined,
    page: viewMode === "calendar" ? 1 : page,
    per_page: viewMode === "calendar" ? 200 : 20,
  });

  const rawExams: ExamListItem[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const exams = useMemo(
    () => sortExamsClient(rawExams, filters.sort),
    [rawExams, filters.sort]
  );

  const handleFilterChange = (patch: Partial<ExamsListFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const pageStats = useMemo(() => computeExamsStats(exams), [exams]);

  useMainProgress(isFetching && !isLoading ? { active: true } : null);

  const totalCount = meta?.total ?? exams.length;
  const pageInfo =
    meta && meta.last_page > 1
      ? `${((meta.current_page - 1) * meta.per_page + 1).toLocaleString("fa-IR")}–${Math.min(
          meta.current_page * meta.per_page,
          meta.total
        ).toLocaleString("fa-IR")} از ${meta.total.toLocaleString("fa-IR")}`
      : undefined;

  const filterPanelProps = {
    filters,
    onChange: handleFilterChange,
    resultCount: exams.length,
    totalCount,
  };

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "بارگذاری آزمون‌ها ناموفق بود."}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Breadcrumb items={[{ label: "مدیریت آزمون‌ها" }]} />

      <QuestionBankLayout
        header={
          <QuestionBankPageHeader
            title="مدیریت آزمون‌ها"
            subtitle="روی هر آزمون کلیک کنید تا سوالات، شرکت‌کنندگان و تنظیمات را مدیریت کنید"
            icon={<ListAltIcon />}
            stats={
              <>
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<ListAltIcon />}
                  label={`${totalCount.toLocaleString("fa-IR")} آزمون`}
                />
                {pageStats.published > 0 && (
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<PublishIcon />}
                    label={`${pageStats.published.toLocaleString("fa-IR")} منتشر`}
                  />
                )}
                {pageStats.draft > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<DraftsIcon />}
                    label={`${pageStats.draft.toLocaleString("fa-IR")} پیش‌نویس`}
                  />
                )}
                {pageStats.ongoing > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    icon={<PlayCircleOutlineIcon />}
                    label={`${pageStats.ongoing.toLocaleString("fa-IR")} در حال برگزاری`}
                  />
                )}
              </>
            }
          />
        }
        toolbar={
          <ExamsListToolbar
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              setPage(1);
            }}
            onCreate={() => router.push("/exams/create")}
            showPaginationHint={viewMode === "list"}
            pageInfo={pageInfo}
          />
        }
        filters={<ExamsFiltersPanel {...filterPanelProps} />}
      >
        {isLoading ? (
          <ExamListSkeleton />
        ) : exams.length === 0 ? (
          <QuestionBankEmptyState
            title="آزمونی یافت نشد"
            description={
              debouncedSearch || filters.status !== "all" || filters.type !== "all"
                ? "فیلترها را تغییر دهید یا جستجو را پاک کنید."
                : "اولین آزمون خود را بسازید."
            }
            action={
              debouncedSearch || filters.status !== "all" || filters.type !== "all"
                ? {
                    label: "پاک کردن فیلترها",
                    onClick: () => {
                      setFilters(DEFAULT_FILTERS);
                      setPage(1);
                    },
                  }
                : { label: "ایجاد آزمون", onClick: () => router.push("/exams/create") }
            }
          />
        ) : viewMode === "calendar" ? (
          <ExamsCalendarView
            exams={exams}
            onSelectExam={(id) => router.push(`/exams/${id}`)}
          />
        ) : (
          <>
            <AnimatedContent
              animationKey={`${page}-${debouncedSearch}-${filters.status}-${filters.type}-${filters.sort}`}
              loading={isFetching && !isLoading}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    xl: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </Box>
            </AnimatedContent>

            {meta && meta.last_page > 1 && (
              <Stack spacing={1} alignItems="center" sx={{ pt: 1 }}>
                {pageInfo && (
                  <Typography variant="body2" color="text.secondary">
                    {pageInfo}
                  </Typography>
                )}
                <Pagination
                  count={meta.last_page}
                  page={meta.current_page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                />
              </Stack>
            )}
          </>
        )}
      </QuestionBankLayout>
    </Stack>
  );
}
