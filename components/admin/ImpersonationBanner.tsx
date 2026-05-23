"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth } from "@/hooks";
import { useStopImpersonating } from "@/hooks/useUsers";
import { clearStoredAdminToken, getStoredAdminToken } from "@/lib/impersonation";
import { getApiClient } from "@/services";

export default function ImpersonationBanner() {
  const { user } = useAuth();
  const stopMutation = useStopImpersonating();

  const impersonation = (user as { impersonation?: { active?: boolean; admin_name?: string } } | null)
    ?.impersonation;

  if (!impersonation?.active && !getStoredAdminToken()) {
    return null;
  }

  const handleExit = () => {
    const adminToken = getStoredAdminToken();
    stopMutation.mutate(undefined, {
      onSettled: () => {
        clearStoredAdminToken();
        const apiClient = getApiClient();
        if (adminToken) {
          apiClient.setToken(adminToken);
          window.location.href = "/admin";
        } else {
          apiClient.setToken(null);
          window.location.href = "/login";
        }
      },
    });
  };

  return (
    <Alert
      severity="info"
      sx={{ borderRadius: 0, py: 0.75 }}
      action={
        <Button
          color="inherit"
          size="small"
          startIcon={<ExitToAppIcon />}
          onClick={handleExit}
          disabled={stopMutation.isPending}
        >
          خروج
        </Button>
      }
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" fontWeight={600}>
          مشاهده به‌عنوان {user?.name}
        </Typography>
        {impersonation?.admin_name && (
          <Typography variant="caption" color="text.secondary">
            (مدیر: {impersonation.admin_name})
          </Typography>
        )}
      </Stack>
    </Alert>
  );
}
