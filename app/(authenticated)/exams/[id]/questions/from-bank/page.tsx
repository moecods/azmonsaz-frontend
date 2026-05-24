"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Breadcrumb from "@/components/Breadcrumb";
import {
  QuestionBankFilters,
  type QuestionBankFilterState,
} from "@/components/exams/exam-questions/QuestionBankFilters";
import { QuestionBankList } from "@/components/exams/exam-questions/QuestionBankList";
import {
  ExamQuestionCartBar,
  EXAM_QUESTION_CART_BAR_RESERVE_PX,
} from "@/components/exams/exam-questions/ExamQuestionCartBar";
import { useExam } from "@/hooks/useExams";
import { useExamQuestionCart } from "@/hooks/useExamQuestionCart";
import { useQuestionCategories } from "@/hooks";
import { useInfiniteQuestions } from "@/hooks/useInfiniteQuestions";
import { useQuestionBankViewMode } from "@/hooks/useQuestionBankViewMode";
import { useDebounce } from "@/hooks/useDebounce";
import { QuestionBankViewToggle } from "@/components/questions/QuestionBankViewToggle";
import { commitExamQuestionCart } from "@/lib/exam-question-cart-commit";
import { getInExamBankQuestionIds, mapExamQuestionsFromApi } from "@/lib/exam-question-utils";
import type { ExamWithGrading } from "@/lib/exam-points";
import type { Question } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { Toast } from "@/components/feedback/Alert/Alert";

export default function ExamQuestionsFromBankPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const examId = params?.id ? parseInt(params.id as string, 10) : null;

  const [filters, setFilters] = useState<QuestionBankFilterState>({
    searchTerm: "",
    selectedCategory: "",
    selectedDifficulty: "",
  });
  const [isCommitting, setIsCommitting] = useState(false);
  const { viewMode, setViewMode, hydrated } = useQuestionBankViewMode();
  const [commitProgress, setCommitProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const debouncedSearch = useDebounce(filters.searchTerm, 400);

  const questionApiFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category_id: filters.selectedCategory || undefined,
      difficulty: filters.selectedDifficulty || undefined,
      sort: "newest" as const,
    }),
    [debouncedSearch, filters.selectedCategory, filters.selectedDifficulty]
  );

  const { data: examData, isLoading: examLoading, error: examError } = useExam(examId);
  const cart = useExamQuestionCart(examId);

  const questionsQuery = useInfiniteQuestions(questionApiFilters);
  const { data: categoriesData } = useQuestionCategories();

  const {
    questions,
    totalCount: totalQuestionCount,
    loadedCount,
    isInitialLoading: questionsLoading,
    isRefetching: questionsRefetching,
    isFetchingNextPage,
    canLoadMore,
    loadMore,
    isError: questionsError,
    error: questionsErrorDetail,
    refetch: refetchQuestions,
  } = questionsQuery;
  const categories = categoriesData ?? [];

  const inExamQuestionIds = useMemo(
    () => getInExamBankQuestionIds(examData ?? null),
    [examData]
  );

  const examQuestionCount = useMemo(() => {
    if (!examData || !examId) return 0;
    return mapExamQuestionsFromApi(examData as ExamWithGrading & { exam_questions?: unknown[] }, examId)
      .length;
  }, [examData, examId]);

  const handleFilterChange = useCallback((patch: Partial<QuestionBankFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleToggleCart = useCallback(
    (question: Question) => {
      if (inExamQuestionIds.has(question.id)) return;
      cart.toggle(question.id);
    },
    [cart, inExamQuestionIds]
  );

  const handleClearCart = useCallback(() => {
    if (cart.count === 0) return;
    if (cart.count > 5 && !window.confirm("همه سوالات از سبد حذف شوند؟")) {
      return;
    }
    cart.clear();
  }, [cart]);

  const handleCommit = useCallback(async () => {
    if (!examId || !examData || cart.count === 0) return;

    const existingQuestions = mapExamQuestionsFromApi(
      examData as ExamWithGrading & { exam_questions?: unknown[] },
      examId
    );

    setIsCommitting(true);
    setCommitProgress(null);

    try {
      const result = await commitExamQuestionCart({
        examId,
        cartIds: cart.ids,
        existingQuestions,
        inExamQuestionIds,
        exam: examData as ExamWithGrading,
        onProgress: setCommitProgress,
      });

      if (result.abortedByMaxScore) {
        setAlert({
          open: true,
          message: result.maxScoreMessage || "مجموع بارم از حد مجاز بیشتر است.",
          severity: "error",
        });
        return;
      }

      if (result.successCount > 0) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.exam(examId) });
      }

      if (result.failedIds.length === 0 && result.successCount > 0) {
        cart.clear();
        router.push(`/exams/${examId}/questions`);
        return;
      }

      if (result.successCount > 0 && result.failedIds.length > 0) {
        cart.removeMany(
          cart.ids.filter((id) => !result.failedIds.includes(id))
        );
      }

      if (result.successCount > 0 && result.failedIds.length > 0) {
        setAlert({
          open: true,
          message: `${result.successCount.toLocaleString("fa-IR")} سوال اضافه شد. ${result.failedIds.length.toLocaleString("fa-IR")} سوال ناموفق بود.`,
          severity: "warning",
        });
        return;
      }

      if (result.errors.length > 0) {
        setAlert({
          open: true,
          message: result.errors[0] || "خطا در افزودن سوالات",
          severity: "error",
        });
      }
    } finally {
      setIsCommitting(false);
      setCommitProgress(null);
    }
  }, [examId, examData, cart, inExamQuestionIds, queryClient, router]);

  if (examLoading || !cart.hydrated) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (examError || !examData || !examId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">بارگذاری آزمون ناموفق بود.</Alert>
        <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} onClick={() => router.push("/exams")}>
          بازگشت
        </Button>
      </Container>
    );
  }

  const cartVisible = cart.count > 0;

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          pb: cartVisible
            ? `${EXAM_QUESTION_CART_BAR_RESERVE_PX + 24}px`
            : 4,
        }}
      >
        <Stack spacing={3}>
          <Breadcrumb
            items={[
              { label: "مدیریت آزمون‌ها", href: "/exams" },
              { label: examData.title, href: `/exams/${examId}` },
              { label: "مدیریت سوالات", href: `/exams/${examId}/questions` },
              { label: "انتخاب از بانک" },
            ]}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                انتخاب از بانک سوالات
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {examData.title}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {hydrated && (
                <QuestionBankViewToggle value={viewMode} onChange={setViewMode} />
              )}
              <Chip
                label={`${examQuestionCount.toLocaleString("fa-IR")} سوال در آزمون`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push(`/exams/${examId}/questions`)}
              >
                بازگشت به سوالات آزمون
              </Button>
            </Stack>
          </Stack>

          <Alert severity="info" icon={<LibraryBooksIcon />}>
            با آیکون سبد کنار هر سوال، آن را به سبد اضافه کنید. سپس از نوار پایین صفحه، همه را
            یکجا به آزمون اضافه کنید. بارم هر سوال را بعداً در لیست سوالات آزمون تنظیم کنید.
          </Alert>

          <QuestionBankFilters
            filters={filters}
            onChange={handleFilterChange}
            categories={categories}
            loadedCount={loadedCount}
            totalCount={totalQuestionCount}
          />

          <QuestionBankList
            questions={questions}
            isInitialLoading={questionsLoading}
            isRefetching={questionsRefetching}
            isError={questionsError}
            errorMessage={
              questionsErrorDetail instanceof Error
                ? questionsErrorDetail.message
                : undefined
            }
            onRetry={() => refetchQuestions()}
            viewMode={viewMode}
            hasNextPage={canLoadMore}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={loadMore}
            inExamQuestionIds={inExamQuestionIds}
            inCart={cart.has}
            onToggleCart={handleToggleCart}
            disabled={isCommitting}
            loadedCount={loadedCount}
            totalCount={totalQuestionCount}
          />
        </Stack>
      </Container>

      <ExamQuestionCartBar
        visible={cartVisible}
        count={cart.count}
        isCommitting={isCommitting}
        commitProgress={commitProgress}
        onCommit={handleCommit}
        onClear={handleClearCart}
      />

      {alert.open && (
        <Toast
          open={alert.open}
          onClose={() => setAlert((a) => ({ ...a, open: false }))}
          message={alert.message}
          severity={alert.severity}
        />
      )}
    </>
  );
}
