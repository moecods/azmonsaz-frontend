"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validation";
import { useForgotPassword } from "@/hooks";
import GuestRoute from "@/components/GuestRoute";
import { getErrorMessage } from "@/lib/error-handler";
import { toEnglishNumbers } from "@/utils/numbers";
import AuthShell from "@/components/auth/AuthShell";
import AuthFormHeader from "@/components/auth/AuthFormHeader";
import { PhoneField, PasswordField, OtpCodeField } from "@/components/auth/auth-fields";
import { authPageSx } from "@/components/auth/auth-layout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPasswordAsync, isResettingPassword } = useForgotPassword();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const phoneFromQuery = searchParams.get("phone_number") || "";

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone_number: phoneFromQuery,
      code: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (phoneFromQuery) {
      setValue("phone_number", phoneFromQuery);
    }
  }, [phoneFromQuery, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    try {
      await resetPasswordAsync({
        phone_number: toEnglishNumbers(data.phone_number),
        code: toEnglishNumbers(data.code),
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "تنظیم مجدد رمز عبور ناموفق بود. لطفاً دوباره تلاش کنید.")
      );
    }
  };

  if (success) {
    return (
      <AuthShell>
        <Stack spacing={2} sx={{ textAlign: "center", py: 2 }}>
          <Alert severity="success" data-cy="reset-success">
            رمز عبور شما تغییر کرد. در حال انتقال به صفحه ورود…
          </Alert>
        </Stack>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthFormHeader
        title="تنظیم رمز جدید"
        subtitle={
          phoneFromQuery
            ? `کد بازیابی برای ${phoneFromQuery} ارسال شده است.`
            : "شماره موبایل و کد بازیابی را وارد کنید."
        }
      />

      <Stack spacing={2}>
        {error && (
          <Alert severity="error" data-cy="reset-error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <PhoneField
                  {...field}
                  label="شماره موبایل"
                  showCountryPrefix={false}
                  data-cy="reset-phone"
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  disabled={isResettingPassword || Boolean(phoneFromQuery)}
                />
              )}
            />

            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <OtpCodeField
                  {...field}
                  label="کد یکبارمصرف"
                  data-cy="reset-code"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  disabled={isResettingPassword}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  label="رمز عبور جدید"
                  autoComplete="new-password"
                  data-cy="reset-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isResettingPassword}
                />
              )}
            />

            <Controller
              name="password_confirmation"
              control={control}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  label="تکرار رمز عبور جدید"
                  autoComplete="new-password"
                  data-cy="reset-password-confirmation"
                  error={!!errors.password_confirmation}
                  helperText={errors.password_confirmation?.message}
                  disabled={isResettingPassword}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isResettingPassword}
              sx={authPageSx.primaryButton}
              data-cy="reset-submit"
            >
              {isResettingPassword ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "ذخیره رمز جدید"
              )}
            </Button>

            <Button
              component={Link}
              href="/login"
              variant="text"
              startIcon={<ArrowBackIcon />}
            >
              بازگشت به ورود
            </Button>
          </Stack>
        </form>
      </Stack>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <Suspense
        fallback={
          <Box sx={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </GuestRoute>
  );
}
