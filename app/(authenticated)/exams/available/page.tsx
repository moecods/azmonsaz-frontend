"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Chip, CircularProgress, Stack } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useAvailableExams } from "@/hooks/useExams";
import Breadcrumb from "@/components/Breadcrumb";
import { MyExamCard } from "@/components/exams/my-exams/MyExamCard";
import { MyExamsFiltersPanel } from "@/components/exams/my-exams/MyExamsFiltersPanel";
import { MyExamsFocusCard } from "@/components/exams/my-exams/MyExamsFocusCard";
import {
  QuestionBankLayout,
  QuestionBankPageHeader,
  QuestionBankEmptyState,
} from "@/components/questions/question-bank";
import { useMainProgress } from "@/components/layout/MainProgressProvider";
import {
  computeMyExamsStats,
  filterMyExams,
  getMyExamsFocus,
  normalizeAvailableExams,
  sortMyExams,
  type MyExamsListFilters,
} from "@/lib/my-exams-utils";

const DEFAULT_FILTERS: MyExamsListFilters = {
  search: "",
  status: "all",
};

export default function AvailableExamsPage() {
  const [filters, setFilters] = useState<MyExamsListFilters>(DEFAULT_FILTERS);
  const { data, isLoading, isFetching, error } = useAvailableExams();

  const allExams = useMemo(() => normalizeAvailableExams(data), [data]);
  const stats = useMemo(() => computeMyExamsStats(allExams), [allExams]);
  const focus = useMemo(() => getMyExamsFocus(allExams), [allExams]);

  const filteredExams = useMemo(() => {
    const list = filterMyExams(allExams, filters);
    return sortMyExams(list);
  }, [allExams, filters]);

  const showFocus =
    focus &&
    (filters.status === "all" || filters.status === "action") &&
    !filters.search.trim();

  useMainProgress(isFetching && !isLoading ? { active: true } : null);

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "خطا در بارگذاری آزمون‌ها"}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Breadcrumb items={[{ label: "آزمون‌های من" }]} />

      <QuestionBankLayout
        header={
          <QuestionBankPageHeader
            title="آزمون‌های من"
            subtitle="آزمون‌هایی که در آن‌ها ثبت‌نام کرده‌اید — شروع، ادامه یا مشاهده نتیجه"
            icon={<SchoolIcon />}
            stats={
              <>
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<SchoolIcon />}
                  label={`${stats.total.toLocaleString("fa-IR")} آزمون`}
                />
                {stats.needsAction > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    icon={<PlayCircleOutlineIcon />}
                    label={`${stats.needsAction.toLocaleString("fa-IR")} نیاز به اقدام`}
                  />
                )}
                {stats.upcoming > 0 && (
                  <Chip
                    size="small"
                    color="info"
                    variant="outlined"
                    icon={<EventIcon />}
                    label={`${stats.upcoming.toLocaleString("fa-IR")} پیشِ رو`}
                  />
                )}
                {stats.completed > 0 && (
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<CheckCircleIcon />}
                    label={`${stats.completed.toLocaleString("fa-IR")} تکمیل`}
                  />
                )}
                {stats.awaiting > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<HourglassEmptyIcon />}
                    label={`${stats.awaiting.toLocaleString("fa-IR")} انتظار نتیجه`}
                  />
                )}
              </>
            }
          />
        }
        filters={
          <MyExamsFiltersPanel
            filters={filters}
            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            resultCount={filteredExams.length}
            totalCount={allExams.length}
            stats={{
              needsAction: stats.needsAction,
              upcoming: stats.upcoming,
              completed: stats.completed,
              awaiting: stats.awaiting,
            }}
          />
        }
      >
        {isLoading ? (
          <Stack alignItems="center" py={8}>
            <CircularProgress />
          </Stack>
        ) : allExams.length === 0 ? (
          <QuestionBankEmptyState
            title="هنوز در آزمونی ثبت‌نام نکرده‌اید"
            description="پس از ثبت‌نام توسط معلم یا از طریق لینک آزمون، اینجا نمایش داده می‌شود."
          />
        ) : filteredExams.length === 0 ? (
          <QuestionBankEmptyState
            title="آزمونی با این فیلتر نیست"
            description="دسته‌بندی یا جستجو را تغییر دهید."
            action={{
              label: "پاک کردن فیلترها",
              onClick: () => setFilters(DEFAULT_FILTERS),
            }}
          />
        ) : (
          <Stack spacing={2}>
            {showFocus && <MyExamsFocusCard focus={focus} />}

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
              {filteredExams
                .filter((e) => !showFocus || e.id !== focus.exam.id)
                .map((exam) => (
                  <MyExamCard key={exam.id} exam={exam} />
                ))}
            </Box>
          </Stack>
        )}
      </QuestionBankLayout>
    </Stack>
  );
}
