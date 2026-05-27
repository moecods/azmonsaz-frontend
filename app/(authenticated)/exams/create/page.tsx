"use client";

import dynamic from "next/dynamic";
import { useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, ExamFormData } from "@/lib/validation";
import { usePartner, useExam, useCreateExam, useUpdateExam, useCompleteExam, useAuth } from "@/hooks";
import { isUsingMockData } from "@/lib/data-service";
import { deepLinkParamsSchema } from "@/lib/validation";
import { loadExamMetaToForm, buildCallbackUrl, isCreatorUser } from "@/lib/exam-utils";
import { handleError } from "@/lib/error-handler";
import { PageLoading } from "@/components/feedback";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageContentLoader from "@/components/layout/PageContentLoader";
import { ExamCreateHeader } from "@/components/exams/create/ExamCreateHeader";

const ExamFormWizard = dynamic(
  () =>
    import("@/components/exams/ExamFormWizard").then((mod) => mod.ExamFormWizard),
  {
    ssr: false,
    loading: () => <PageLoading message="در حال بارگذاری فرم..." />,
  }
);

function CreateExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const isCreator = useMemo(() => isCreatorUser(user?.roles), [user?.roles]);
  const isAdmin = useMemo(() => user?.roles?.includes("admin"), [user?.roles]);

  const deepLinkParams = useMemo(
    () => ({
      partner_id: searchParams.get("partner_id") || (isUsingMockData() ? "1" : ""),
      callback_url:
        searchParams.get("callback_url") ||
        (isUsingMockData() ? "https://example.com/callback" : ""),
      exam_id: searchParams.get("exam_id") || undefined,
    }),
    [searchParams]
  );

  const validationResult = useMemo(
    () =>
      isUsingMockData() || isCreator
        ? { success: true, data: deepLinkParams }
        : deepLinkParamsSchema.safeParse(deepLinkParams),
    [isCreator, deepLinkParams]
  );

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      type: "online",
      questions: [],
      duration_minutes: null,
      passing_score: null,
      grading_mode: "numeric_percent",
      grading_config: null,
      schedule_type: "fixed_window",
      instructions: "",
      tags: [],
      exam_date: null,
      start_time: null,
      end_time: null,
      available_from: null,
      due_by: null,
      register_until: null,
      result_release_after_exam_end: true,
      result_release_after_grading_complete: true,
      result_release_requires_manual: false,
      created_by: null,
    },
  });

  const { setValue } = form;

  const partnerId =
    validationResult.success && deepLinkParams.partner_id
      ? parseInt(deepLinkParams.partner_id, 10)
      : null;
  const examId =
    validationResult.success && deepLinkParams.exam_id
      ? parseInt(deepLinkParams.exam_id, 10)
      : null;

  const showCreatorSelect = isAdmin && !examId;

  const { data: partnerData } = usePartner(partnerId);
  const { data: existingExam, isLoading: isLoadingExam } = useExam(examId);

  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const completeExamMutation = useCompleteExam();

  const mutationError =
    (createExamMutation.error instanceof Error && createExamMutation.error.message) ||
    (updateExamMutation.error instanceof Error && updateExamMutation.error.message) ||
    (completeExamMutation.error instanceof Error && completeExamMutation.error.message) ||
    null;

  useEffect(() => {
    if (existingExam) {
      setValue("title", existingExam.title);
      setValue("type", existingExam.type || "online");

      const metaFields = loadExamMetaToForm(existingExam);
      Object.entries(metaFields).forEach(([key, value]) => {
        setValue(key as keyof ExamFormData, value);
      });
    }
  }, [existingExam, setValue]);

  const handleRedirectAfterSave = (
    savedExamId: number,
    additionalParams?: Record<string, string>
  ) => {
    if (deepLinkParams.callback_url && validationResult.success) {
      try {
        const callbackUrl = buildCallbackUrl(
          deepLinkParams.callback_url,
          savedExamId,
          additionalParams
        );
        window.location.href = callbackUrl;
      } catch (error) {
        handleError(error, { context: "Callback URL", logToConsole: true });
      }
    } else {
      router.push(`/exams/${savedExamId}`);
    }
  };

  const onSubmit = async (data: ExamFormData, redirectToQuestions = false) => {
    const baseData = {
      title: data.title,
      type: data.type,
      duration_minutes: data.duration_minutes ?? undefined,
      passing_score: data.passing_score ?? undefined,
      grading_mode: data.grading_mode ?? undefined,
      grading_config: data.grading_config ?? undefined,
      instructions: data.instructions ?? undefined,
      tags: data.tags ?? undefined,
      exam_date: data.exam_date ?? undefined,
      start_time: data.start_time ?? undefined,
      end_time: data.end_time ?? undefined,
      result_release_after_exam_end: data.result_release_after_exam_end,
      result_release_after_grading_complete: data.result_release_after_grading_complete,
      result_release_requires_manual: data.result_release_requires_manual,
    };

    if (existingExam) {
      try {
        const response = await updateExamMutation.mutateAsync({
          id: existingExam.id,
          data: baseData,
        });
        if (redirectToQuestions) {
          router.push(`/exams/${response.id}/questions`);
        } else {
          handleRedirectAfterSave(response.id);
        }
      } catch (error) {
        handleError(error, { context: "Update Exam" });
      }
    } else {
      const examData = {
        ...baseData,
        ...(showCreatorSelect && {
          created_by: Number(data.created_by ?? user?.id),
        }),
        ...(validationResult.success &&
          deepLinkParams.partner_id && {
            partner_id: parseInt(deepLinkParams.partner_id, 10),
          }),
        ...(validationResult.success &&
          deepLinkParams.callback_url && {
            callback_url: deepLinkParams.callback_url,
          }),
      };

      try {
        const response = await createExamMutation.mutateAsync(examData);
        if (redirectToQuestions) {
          router.push(`/exams/${response.id}/questions`);
        } else {
          handleRedirectAfterSave(response.id);
        }
      } catch (error) {
        handleError(error, { context: "Create Exam" });
      }
    }
  };

  const handleCompleteExam = () => {
    if (!existingExam) return;

    completeExamMutation.mutate(existingExam.id, {
      onSuccess: (response) => {
        handleRedirectAfterSave(existingExam.id, { pdf_url: response.pdf_url });
      },
      onError: (error) => {
        handleError(error, { context: "Complete Exam" });
      },
    });
  };

  return (
    <PageContentLoader isLoading={isLoadingExam && !!examId}>
      <Stack spacing={2.5}>
        <ExamCreateHeader
          isEdit={!!existingExam}
          partnerName={partnerData?.name}
          onBack={() => router.push("/exams")}
        />

        {isUsingMockData() && (
          <Alert severity="info">
            حالت mock فعال است — Partner ID: {deepLinkParams.partner_id}
          </Alert>
        )}

        {mutationError && (
          <Alert severity="error">{mutationError}</Alert>
        )}

        {existingExam && (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleCompleteExam}
              disabled={completeExamMutation.isPending}
            >
              {completeExamMutation.isPending ? "در حال تکمیل..." : "تکمیل آزمون (آفلاین)"}
            </Button>
          </Stack>
        )}

        <ExamFormWizard
          form={form}
          onSubmit={onSubmit}
          isSubmitting={createExamMutation.isPending || updateExamMutation.isPending}
          existingExam={!!existingExam}
          showCreatorSelect={showCreatorSelect}
          defaultOwnerUserId={user?.id ?? null}
        />
      </Stack>
    </PageContentLoader>
  );
}

export default function CreateExamPage() {
  return (
    <ProtectedRoute requiredPermission="create exams">
      <Suspense fallback={<PageLoading />}>
        <CreateExamContent />
      </Suspense>
    </ProtectedRoute>
  );
}
