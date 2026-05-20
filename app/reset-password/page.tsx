"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack,
  Container,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validation";
import { useForgotPassword } from "@/hooks";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isResettingPassword } = useForgotPassword();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const phoneNumber = searchParams.get("phone_number") || "";

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone_number: phoneNumber,
      code: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (phoneNumber) {
      setValue("phone_number", phoneNumber);
    }
  }, [phoneNumber, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    try {
      await resetPassword(data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "تنظیم مجدد رمز عبور ناموفق بود. لطفا دوباره تلاش کنید.";
      setError(message);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card sx={{ width: "100%", maxWidth: 450 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} textAlign="center">
                <Alert severity="success">
                  رمز عبور شما با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 450 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" component="h1" textAlign="center">
                تنظیم مجدد رمز عبور
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="شماره موبایل"
                        type="tel"
                        fullWidth
                        placeholder="09123456789"
                        autoComplete="tel"
                        error={!!errors.phone_number}
                        helperText={
                          errors.phone_number?.message ||
                          "فرمت: 09123456789 یا +989123456789"
                        }
                        disabled={isResettingPassword}
                      />
                    )}
                  />

                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="کد یکبار مصرف"
                        type="text"
                        fullWidth
                        placeholder="123456"
                        inputProps={{ maxLength: 6 }}
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
                      <TextField
                        {...field}
                        label="رمز عبور جدید"
                        type="password"
                        fullWidth
                        autoComplete="new-password"
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
                      <TextField
                        {...field}
                        label="تایید رمز عبور جدید"
                        type="password"
                        fullWidth
                        autoComplete="new-password"
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
                    size="large"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? "در حال تنظیم..." : "تنظیم رمز عبور"}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ textAlign: "center" }}>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                  >
                    بازگشت به صفحه ورود
                  </Typography>
                </Link>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
