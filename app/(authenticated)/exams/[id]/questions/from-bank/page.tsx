"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
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
import { useConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import {
  QuestionBankLayout,
  QuestionBankPageHeader,
  QuestionBankToolbar,
} from "@/components/questions/question-bank";
import { useMainProgress } from "@/components/layout/MainProgressProvider";

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
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

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

  const handleClearCart = useCallback(async () => {
    if (cart.count === 0) return;
    if (cart.count > 5) {
      const ok = await confirm({
        title: "پاک کردن سبد",
        message: "همه سوالات از سبد حذف شوند؟",
        confirmLabel: "پاک کردن",
        confirmColor: "warning",
      });
      if (!ok) return;
    }
    cart.clear();
  }, [cart, confirm]);

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
        toast.error(result.maxScoreMessage || "مجموع بارم از حد مجاز بیشتر است.");
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
        cart.removeMany(cart.ids.filter((id) => !result.failedIds.includes(id)));
      }

      if (result.successCount > 0 && result.failedIds.length > 0) {
        toast.warning(
          `${result.successCount.toLocaleString("fa-IR")} سوال اضافه شد. ${result.failedIds.length.toLocaleString("fa-IR")} سوال ناموفق بود.`
        );
        return;
      }

      if (result.errors.length > 0) {
        toast.error(result.errors[0] || "خطا در افزودن سوالات");
      }
    } finally {
      setIsCommitting(false);
      setCommitProgress(null);
    }
  }, [examId, examData, cart, inExamQuestionIds, queryClient, router, toast]);

  useMainProgress(
    !questionsLoading && (questionsRefetching || isFetchingNextPage)
      ? { active: true }
      : null
  );

  if (examLoading || !cart.hydrated) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (examError || !examData || !examId) {
    return (
      <Stack spacing={2} sx={{ py: 4 }}>
        <Alert severity="error">بارگذاری آزمون ناموفق بود.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/exams")}>
          بازگشت
        </Button>
      </Stack>
    );
  }

  const cartVisible = cart.count > 0;

  return (
    <>
      <Stack spacing={2}>
        <Breadcrumb
          items={[
            { label: "مدیریت آزمون‌ها", href: "/exams" },
            { label: examData.title, href: `/exams/${examId}` },
            { label: "مدیریت سوالات", href: `/exams/${examId}/questions` },
            { label: "انتخاب از بانک" },
          ]}
        />

        <QuestionBankLayout
          bottomReservePx={cartVisible ? EXAM_QUESTION_CART_BAR_RESERVE_PX + 24 : 0}
          header={
            <QuestionBankPageHeader
              title="انتخاب از بانک"
              subtitle={examData.title}
              icon={<LibraryAddIcon />}
              stats={
                <>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={`${examQuestionCount.toLocaleString("fa-IR")} سوال در آزمون`}
                  />
                  {cart.count > 0 && (
                    <Chip
                      size="small"
                      color="secondary"
                      icon={<ShoppingCartOutlinedIcon />}
                      label={`${cart.count.toLocaleString("fa-IR")} در سبد`}
                    />
                  )}
                </>
              }
              actions={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.push(`/exams/${examId}/questions`)}
                >
                  بازگشت
                </Button>
              }
            />
          }
          filters={
            <QuestionBankFilters
              filters={filters}
              onChange={handleFilterChange}
              categories={categories}
              loadedCount={loadedCount}
              totalCount={totalQuestionCount}
              isRefetching={questionsRefetching}
            />
          }
          toolbar={
            hydrated ? (
              <QuestionBankToolbar
                hint="روی آیکون سبد کنار هر سوال بزنید، سپس از نوار پایین همه را یکجا به آزمون اضافه کنید. بارم را بعداً در لیست سوالات تنظیم کنید."
                viewToggle={
                  <QuestionBankViewToggle value={viewMode} onChange={setViewMode} size="small" />
                }
              />
            ) : undefined
          }
        >
          <QuestionBankList
            questions={questions}
            isInitialLoading={questionsLoading}
            isRefetching={questionsRefetching}
            isError={questionsError}
            errorMessage={
              questionsErrorDetail instanceof Error ? questionsErrorDetail.message : undefined
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
        </QuestionBankLayout>
      </Stack>

      <ExamQuestionCartBar
        visible={cartVisible}
        count={cart.count}
        isCommitting={isCommitting}
        commitProgress={commitProgress}
        onCommit={handleCommit}
        onClear={handleClearCart}
      />

      {confirmDialog}
    </>
  );
}
