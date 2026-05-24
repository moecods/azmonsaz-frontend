"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AuthUser } from "@/types";
import { useAuth, useUpdateUser } from "@/hooks";
import { handleError } from "@/lib/error-handler";
import { formatProfileDate } from "@/lib/profile-utils";

const profileSchema = z.object({
  email: z
    .string()
    .email("ایمیل معتبر نیست")
    .max(255, "ایمیل نمی‌تواند بیشتر از 255 کاراکتر باشد")
    .optional()
    .nullable()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileAccountPanelProps {
  user: AuthUser;
  onSuccess?: (message: string) => void;
}

export function ProfileAccountPanel({ user, onSuccess }: ProfileAccountPanelProps) {
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();
  const updateMutation = useUpdateUser();

  const hasPro =
    !!user.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { email: user.email || "" },
  });

  const onSubmit = async (data: ProfileFormData) => {
    updateMutation.mutate(
      {
        id: user.id,
        data: { email: data.email?.trim() || null },
      },
      {
        onSuccess: () => {
          onSuccess?.("ایمیل با موفقیت به‌روزرسانی شد");
        },
        onError: (error: unknown) => {
          handleError(error, { context: "Update Profile" });
        },
      }
    );
  };

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            اطلاعات تماس
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <PhoneIcon color="action" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  شماره موبایل
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {user.phone_number}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  شماره موبایل شناسه ورود شماست و قابل تغییر نیست.
                </Typography>
              </Box>
            </Stack>
            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>
              ویرایش ایمیل
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ""}
                      label="ایمیل"
                      type="email"
                      fullWidth
                      placeholder="example@email.com"
                      error={!!errors.email}
                      helperText={
                        errors.email?.message ||
                        "اختیاری — برای بازیابی رمز و اطلاع‌رسانی‌ها"
                      }
                      disabled={updateMutation.isPending}
                    />
                  )}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    onClick={() => reset({ email: user.email || "" })}
                    disabled={updateMutation.isPending}
                  >
                    بازنشانی
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateMutation.isPending}
                    startIcon={
                      updateMutation.isPending ? <CircularProgress size={18} color="inherit" /> : null
                    }
                  >
                    {updateMutation.isPending ? "در حال ذخیره…" : "ذخیره ایمیل"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            امنیت و حساب
          </Typography>
          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => router.push("/reset-password")}
              sx={{ justifyContent: "flex-start" }}
            >
              تغییر رمز عبور
            </Button>
            <Button
              variant="outlined"
              startIcon={<WorkspacePremiumIcon />}
              color={hasPro ? "warning" : "inherit"}
              onClick={() => router.push("/subscription")}
              sx={{ justifyContent: "flex-start" }}
            >
              {hasPro
                ? `اشتراک Pro تا ${formatProfileDate(user.subscription?.ends_at)}`
                : "خرید یا تمدید اشتراک Pro"}
            </Button>
            <Divider sx={{ my: 0.5 }} />
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              disabled={isLoggingOut}
              onClick={() => logout()}
              sx={{ justifyContent: "flex-start" }}
            >
              {isLoggingOut ? "در حال خروج…" : "خروج از حساب"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
