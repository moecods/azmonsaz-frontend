"use client";

import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import type { AuthUser } from "@/types";
import AvatarUpload from "@/components/profile/AvatarUpload";
import {
  formatProfileDate,
  getRoleChipColor,
  getRoleLabel,
} from "@/lib/profile-utils";

interface ProfileHeroProps {
  user: AuthUser;
  quickStats?: { label: string; value: string }[];
}

export function ProfileHero({ user, quickStats }: ProfileHeroProps) {
  const theme = useTheme();
  const hasPro =
    !!user.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 55%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "center", md: "flex-start" }}
        sx={{ p: { xs: 2, md: 3 } }}
      >
        <AvatarUpload />
        <Box sx={{ flex: 1, width: "100%", textAlign: { xs: "center", md: "start" } }}>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            alignItems="center"
            justifyContent={{ xs: "center", md: "flex-start" }}
            sx={{ mb: 0.5 }}
          >
            <Typography variant="h4" fontWeight={800}>
              {user.name}
            </Typography>
            {hasPro && (
              <Chip
                size="small"
                icon={<WorkspacePremiumIcon />}
                label="Pro"
                color="warning"
                variant="filled"
              />
            )}
            {!user.is_active && (
              <Chip size="small" label="غیرفعال" color="error" variant="outlined" />
            )}
          </Stack>

          {user.roles && user.roles.length > 0 && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.5}
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{ mb: 1.5 }}
            >
              {user.roles.map((role) => (
                <Chip
                  key={role}
                  label={getRoleLabel(role)}
                  size="small"
                  color={getRoleChipColor(role)}
                  variant="outlined"
                />
              ))}
            </Stack>
          )}

          <Stack
            spacing={0.75}
            alignItems={{ xs: "center", md: "flex-start" }}
            sx={{ color: "text.secondary" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">{user.phone_number}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon fontSize="small" />
              <Typography variant="body2">{user.email?.trim() || "ایمیل ثبت نشده"}</Typography>
            </Stack>
            {user.created_at && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">
                  عضو از {formatProfileDate(user.created_at)}
                </Typography>
              </Stack>
            )}
          </Stack>

          {quickStats && quickStats.length > 0 && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.75}
              sx={{ mt: 2 }}
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              {quickStats.map((s) => (
                <Chip key={s.label} size="small" label={`${s.label}: ${s.value}`} variant="outlined" />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
