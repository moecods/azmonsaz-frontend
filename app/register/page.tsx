"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validation";
import { useRegister } from "@/hooks";
import GuestRoute from "@/components/GuestRoute";
import { getErrorMessage } from "@/lib/error-handler";
import { toEnglishNumbers } from "@/utils/numbers";
import AuthShell from "@/components/auth/AuthShell";
import AuthFormHeader from "@/components/auth/AuthFormHeader";
import { PhoneField, PasswordField } from "@/components/auth/auth-fields";
import { authPageSx } from "@/components/auth/auth-layout";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerMutation.mutateAsync({
        ...data,
        phone_number: toEnglishNumbers(data.phone_number),
      });
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید."));
    }
  };

  return (
    <GuestRoute redirectTo="/dashboard">
      <AuthShell
        brandTagline="در چند دقیقه حساب بسازید و آزمون‌های آنلاین را مدیریت یا در آن‌ها شرکت کنید."
        brandBullets={[
          "ثبت‌نام رایگان با شماره موبایل",
          "دسترسی به آزمون‌های فعال سازمان شما",
          "پروفایل و امنیت قابل تنظیم",
        ]}
      >
        <AuthFormHeader
          title="ثبت‌نام"
          subtitle="اطلاعات زیر را وارد کنید تا حساب کاربری شما ساخته شود."
        />

        <Stack spacing={2}>
          {error && (
            <Alert severity="error" data-cy="register-error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام و نام‌خانوادگی"
                    fullWidth
                    autoComplete="name"
                    inputProps={{ "data-cy": "register-name" }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={registerMutation.isPending}
                    sx={authPageSx.field}
                  />
                )}
              />

              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <PhoneField
                    {...field}
                    label="شماره موبایل"
                    showCountryPrefix={false}
                    data-cy="register-phone"
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                    disabled={registerMutation.isPending}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <PasswordField
                    {...field}
                    label="رمز عبور"
                    autoComplete="new-password"
                    data-cy="register-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={registerMutation.isPending}
                  />
                )}
              />

              <Controller
                name="password_confirmation"
                control={control}
                render={({ field }) => (
                  <PasswordField
                    {...field}
                    label="تکرار رمز عبور"
                    autoComplete="new-password"
                    data-cy="register-password-confirmation"
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation?.message}
                    disabled={registerMutation.isPending}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={registerMutation.isPending}
                sx={{ ...authPageSx.primaryButton, mt: 1 }}
                data-cy="register-submit"
              >
                {registerMutation.isPending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "ثبت‌نام"
                )}
              </Button>
            </Stack>
          </form>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: { xs: "center", md: "start" } }}
          >
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/login" style={{ fontWeight: 700 }}>
              ورود
            </Link>
          </Typography>
        </Stack>
      </AuthShell>
    </GuestRoute>
  );
}
