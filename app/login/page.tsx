"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  loginSchema,
  otpLoginRequestSchema,
  otpLoginVerifySchema,
  forgotPasswordSchema,
  type LoginFormData,
  type OtpLoginRequestFormData,
  type OtpLoginVerifyFormData,
  type ForgotPasswordFormData,
} from "@/lib/validation";
import { useAuth, useOtpLogin, useForgotPassword } from "@/hooks";
import GuestRoute from "@/components/GuestRoute";
import { getErrorMessage } from "@/lib/error-handler";
import { toEnglishNumbers } from "@/utils/numbers";
import AuthShell from "@/components/auth/AuthShell";
import AuthFormHeader from "@/components/auth/AuthFormHeader";
import { PhoneField, PasswordField, OtpCodeField } from "@/components/auth/auth-fields";
import { authPageSx } from "@/components/auth/auth-layout";

type LoginMethod = "password" | "otp";
type LoginView = "sign-in" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsync, isLoggingIn } = useAuth();
  const { requestOtpAsync, verifyOtpAsync, isRequestingOtp, isVerifyingOtp } = useOtpLogin();
  const { requestOtpAsync: requestForgotOtpAsync, isRequestingOtp: isRequestingForgotOtp } =
    useForgotPassword();

  const [view, setView] = useState<LoginView>("sign-in");
  const [method, setMethod] = useState<LoginMethod>("password");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const passwordForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone_number: "", password: "" },
  });

  const otpRequestForm = useForm<OtpLoginRequestFormData>({
    resolver: zodResolver(otpLoginRequestSchema),
    defaultValues: { phone_number: "" },
  });

  const otpVerifyForm = useForm<OtpLoginVerifyFormData>({
    resolver: zodResolver(otpLoginVerifySchema),
    defaultValues: { phone_number: "", code: "" },
  });

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone_number: "" },
  });

  const clearAlerts = () => {
    setError(null);
    setSuccess(null);
    setDebugCode(null);
  };

  const handlePasswordLogin = async (data: LoginFormData) => {
    clearAlerts();
    try {
      await loginAsync({
        phone_number: toEnglishNumbers(data.phone_number),
        password: data.password,
      });
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "ورود ناموفق بود. لطفاً دوباره تلاش کنید."));
    }
  };

  const handleOtpRequest = async (data: OtpLoginRequestFormData) => {
    clearAlerts();
    try {
      const phone = toEnglishNumbers(data.phone_number);
      const result = await requestOtpAsync({ phone_number: phone });
      setOtpSent(true);
      setSuccess("کد یکبارمصرف به شماره شما ارسال شد");
      if (result?.debug_code) setDebugCode(result.debug_code);
      otpVerifyForm.setValue("phone_number", phone);
      otpVerifyForm.setValue("code", "");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "ارسال کد ناموفق بود"));
    }
  };

  const handleOtpVerify = async (data: OtpLoginVerifyFormData) => {
    clearAlerts();
    try {
      await verifyOtpAsync({
        phone_number: toEnglishNumbers(data.phone_number),
        code: toEnglishNumbers(data.code),
      });
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "کد نامعتبر است یا منقضی شده است"));
    }
  };

  const handleForgotRequest = async (data: ForgotPasswordFormData) => {
    clearAlerts();
    try {
      const phone = toEnglishNumbers(data.phone_number);
      const result = await requestForgotOtpAsync({ phone_number: phone });
      if (result?.debug_code) setDebugCode(result.debug_code);
      router.push(`/reset-password?phone_number=${encodeURIComponent(phone)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "ارسال کد بازیابی ناموفق بود."));
    }
  };

  const openForgot = () => {
    const phone =
      passwordForm.getValues("phone_number") ||
      otpRequestForm.getValues("phone_number") ||
      "";
    forgotForm.setValue("phone_number", phone);
    setView("forgot");
    clearAlerts();
  };

  const backToSignIn = () => {
    setView("sign-in");
    clearAlerts();
  };

  return (
    <GuestRoute redirectTo="/dashboard">
      <AuthShell>
        {view === "forgot" ? (
          <>
            <AuthFormHeader
              title="فراموشی رمز عبور"
            />

            <Stack spacing={2}>
              {error && (
                <Alert severity="error" data-cy="login-error">
                  {error}
                </Alert>
              )}
              {success && <Alert severity="success">{success}</Alert>}
              {debugCode && (
                <Alert severity="info">
                  کد تست: <strong dir="ltr">{debugCode}</strong>
                </Alert>
              )}

              <form onSubmit={forgotForm.handleSubmit(handleForgotRequest)}>
                <Stack spacing={2}>
                  <Controller
                    name="phone_number"
                    control={forgotForm.control}
                    render={({ field }) => (
                      <PhoneField
                        {...field}
                        label="شماره موبایل"
                        data-cy="login-phone"
                        error={!!forgotForm.formState.errors.phone_number}
                        helperText={forgotForm.formState.errors.phone_number?.message}
                        disabled={isRequestingForgotOtp}
                      />
                    )}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isRequestingForgotOtp}
                    sx={authPageSx.primaryButton}
                    data-cy="login-submit"
                  >
                    {isRequestingForgotOtp ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "ارسال کد بازیابی"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={backToSignIn}
                  >
                    بازگشت به ورود
                  </Button>
                </Stack>
              </form>
            </Stack>
          </>
        ) : (
          <>
            <AuthFormHeader
              title="ورود به حساب"
            />

            <ToggleButtonGroup
              value={method}
              exclusive
              fullWidth
              onChange={(_, v) => {
                if (!v) return;
                setMethod(v);
                setOtpSent(false);
                clearAlerts();
              }}
              sx={{ mb: 2.5 }}
            >
              <ToggleButton value="password" sx={{ py: 1, fontWeight: 600 }}>
                رمز عبور
              </ToggleButton>
              <ToggleButton value="otp" sx={{ py: 1, fontWeight: 600 }}>
                کد یکبارمصرف
              </ToggleButton>
            </ToggleButtonGroup>

            <Stack spacing={2}>
              {error && (
                <Alert severity="error" data-cy="login-error">
                  {error}
                </Alert>
              )}
              {success && <Alert severity="success">{success}</Alert>}
              {debugCode && (
                <Alert severity="info">
                  کد تست: <strong dir="ltr">{debugCode}</strong>
                </Alert>
              )}

              {method === "password" && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}>
                  <Stack spacing={2}>
                    <Controller
                      name="phone_number"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <PhoneField
                          {...field}
                          label="شماره موبایل"
                          showCountryPrefix={false}
                          data-cy="login-phone"
                          error={!!passwordForm.formState.errors.phone_number}
                          helperText={passwordForm.formState.errors.phone_number?.message}
                          disabled={isLoggingIn}
                        />
                      )}
                    />
                    <Controller
                      name="password"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <PasswordField
                          {...field}
                          label="رمز عبور"
                          data-cy="login-password"
                          error={!!passwordForm.formState.errors.password}
                          helperText={passwordForm.formState.errors.password?.message}
                          disabled={isLoggingIn}
                        />
                      )}
                    />
                    <Box sx={{ textAlign: "end" }}>
                      <Button type="button" size="small" onClick={openForgot}>
                        فراموشی رمز عبور؟
                      </Button>
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isLoggingIn}
                      sx={authPageSx.primaryButton}
                      data-cy="login-submit"
                    >
                      {isLoggingIn ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        "ورود"
                      )}
                    </Button>
                  </Stack>
                </form>
              )}

              {method === "otp" && !otpSent && (
                <form onSubmit={otpRequestForm.handleSubmit(handleOtpRequest)}>
                  <Stack spacing={2}>
                    <Controller
                      name="phone_number"
                      control={otpRequestForm.control}
                      render={({ field }) => (
                        <PhoneField
                          {...field}
                          label="شماره موبایل"
                          data-cy="login-phone"
                          error={!!otpRequestForm.formState.errors.phone_number}
                          helperText={otpRequestForm.formState.errors.phone_number?.message}
                          disabled={isRequestingOtp}
                        />
                      )}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isRequestingOtp}
                      sx={authPageSx.primaryButton}
                      data-cy="login-submit"
                    >
                      {isRequestingOtp ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        "دریافت کد ورود"
                      )}
                    </Button>
                  </Stack>
                </form>
              )}

              {method === "otp" && otpSent && (
                <form onSubmit={otpVerifyForm.handleSubmit(handleOtpVerify)}>
                  <Stack spacing={2}>
                    <Controller
                      name="phone_number"
                      control={otpVerifyForm.control}
                      render={({ field }) => (
                        <PhoneField
                          {...field}
                          label="شماره موبایل"
                          disabled
                          data-cy="login-phone"
                        />
                      )}
                    />
                    <Controller
                      name="code"
                      control={otpVerifyForm.control}
                      render={({ field }) => (
                        <OtpCodeField
                          {...field}
                          label="کد یکبارمصرف"
                          data-cy="login-otp-code"
                          error={!!otpVerifyForm.formState.errors.code}
                          helperText={otpVerifyForm.formState.errors.code?.message}
                          disabled={isVerifyingOtp}
                        />
                      )}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isVerifyingOtp}
                      sx={authPageSx.primaryButton}
                      data-cy="login-submit"
                    >
                      {isVerifyingOtp ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        "تایید و ورود"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => {
                        setOtpSent(false);
                        clearAlerts();
                      }}
                    >
                      ویرایش شماره موبایل
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>

            <Button component={Link} href="/register" variant="text" sx={{ mt: 1 }}>
              ثبت‌نام
            </Button>
          </>
        )}
      </AuthShell>
    </GuestRoute>
  );
}
