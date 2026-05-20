"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, ExamFormData } from "@/lib/validation";
import { usePartner, useExam, useCreateExam, useUpdateExam, useCompleteExam, useAuth } from "@/hooks";
import { isUsingMockData } from "@/lib/data-service";
import { deepLinkParamsSchema } from "@/lib/validation";
import Breadcrumb from "@/components/Breadcrumb";
import { loadExamMetaToForm, buildCallbackUrl, isCreatorUser } from "@/lib/exam-utils";
import { handleError } from "@/lib/error-handler";
import { PageLoading } from "@/components/feedback";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageContentLoader from "@/components/layout/PageContentLoader";

// Heavy form + Persian date pickers — load in a separate chunk so ?_rsc= navigation is faster
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
      description: "",
      subject: "",
      type: "online",
      questions: [],
      duration_minutes: null,
      passing_score: null,
      instructions: "",
      tags: [],
      exam_date: null,
      start_time: null,
      end_time: null,
    },
  });

  const {
    handleSubmit,
    setValue,
  } = form;

  const partnerId =
    validationResult.success && deepLinkParams.partner_id
      ? parseInt(deepLinkParams.partner_id, 10)
      : null;
  const examId =
    validationResult.success && deepLinkParams.exam_id
      ? parseInt(deepLinkParams.exam_id, 10)
      : null;

  const { data: partnerData } = usePartner(partnerId);
  const { data: existingExam, isLoading: isLoadingExam } = useExam(examId);

  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const completeExamMutation = useCompleteExam();

  useEffect(() => {
    if (existingExam) {
      setValue("title", existingExam.title);
      setValue("description", existingExam.description || "");
      setValue("subject", existingExam.subject || "");
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
      description: data.description,
      subject: data.subject,
      type: data.type,
      duration_minutes: data.duration_minutes ?? undefined,
      passing_score: data.passing_score ?? undefined,
      instructions: data.instructions ?? undefined,
      tags: data.tags ?? undefined,
      exam_date: data.exam_date ?? undefined,
      start_time: data.start_time ?? undefined,
      end_time: data.end_time ?? undefined,
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
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Breadcrumb
            items={[
              { label: "مدیریت آزمون‌ها", href: "/exams" },
              { label: existingExam ? "ویرایش آزمون" : "ایجاد آزمون جدید" },
            ]}
          />
          <Box>
            <Typography variant="h4" gutterBottom>
              {existingExam ? "ویرایش آزمون" : "ایجاد آزمون جدید"}
            </Typography>
            {isUsingMockData() && (
              <Alert severity="info" sx={{ mb: 2 }}>
                🧪 Using mock data for development. Partner ID: {deepLinkParams.partner_id}
              </Alert>
            )}
            {partnerData && (
              <Typography color="text.secondary">Partner: {partnerData.name}</Typography>
            )}
          </Box>

          {(createExamMutation.isError ||
            updateExamMutation.isError ||
            completeExamMutation.isError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createExamMutation.error instanceof Error && createExamMutation.error.message}
              {updateExamMutation.error instanceof Error && updateExamMutation.error.message}
              {completeExamMutation.error instanceof Error &&
                completeExamMutation.error.message}
              {!createExamMutation.error &&
                !updateExamMutation.error &&
                !completeExamMutation.error &&
                "خطایی رخ داد. لطفا دوباره تلاش کنید."}
            </Alert>
          )}

          {existingExam && (
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleCompleteExam}
                disabled={completeExamMutation.isPending}
              >
                {completeExamMutation.isPending ? "در حال تکمیل..." : "تکمیل آزمون"}
              </Button>
            </Stack>
          )}

          <ExamFormWizard
            form={form}
            onSubmit={onSubmit}
            isSubmitting={createExamMutation.isPending || updateExamMutation.isPending}
            existingExam={!!existingExam}
          />
        </Stack>
      </Container>
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
