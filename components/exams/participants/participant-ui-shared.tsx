"use client";

import type { ReactNode } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import LinkIcon from "@mui/icons-material/Link";
import type { ExamUser, UserParticipant } from "@/components/exams/ParticipantManagement.types";

export type ParticipantAddMethod = "groups" | "search" | "phone" | "national_id" | "links";

export const PARTICIPANT_ADD_METHODS: ReadonlyArray<{
  value: ParticipantAddMethod;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    value: "groups",
    label: "گروه",
    description: "افزودن یکجای اعضای گروه‌های آموزشی",
    icon: <GroupIcon fontSize="small" />,
  },
  {
    value: "search",
    label: "جستجو",
    description: "یافتن کاربران ثبت‌شده در سامانه",
    icon: <SearchIcon fontSize="small" />,
  },
  {
    value: "phone",
    label: "موبایل",
    description: "افزودن با لیست شماره موبایل",
    icon: <PhoneIcon fontSize="small" />,
  },
  {
    value: "national_id",
    label: "کد ملی",
    description: "افزودن با لیست کد ملی",
    icon: <BadgeIcon fontSize="small" />,
  },
  {
    value: "links",
    label: "لینک دعوت",
    description: "اشتراک لینک ثبت‌نام یا ورود به آزمون",
    icon: <LinkIcon fontSize="small" />,
  },
];

export function ParticipantNameCell({ user }: { user: ExamUser | null | undefined }) {
  const name = user?.name || "—";
  const email = user?.email;
  const nationalId = user?.national_id;
  if (!email && !nationalId) {
    return (
      <Typography variant="body2" fontWeight={600}>
        {name}
      </Typography>
    );
  }
  return (
    <Box>
      <Typography variant="body2" fontWeight={600}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {[email, nationalId].filter(Boolean).join(" · ")}
      </Typography>
    </Box>
  );
}

export function ParticipantStatusChip({ participant }: { participant: UserParticipant }) {
  if (participant.completed_at) {
    return (
      <Chip
        icon={participant.passed ? <CheckCircleIcon /> : <CancelIcon />}
        label={participant.passed ? "قبول" : "رد"}
        color={participant.passed ? "success" : "error"}
        size="small"
        variant="outlined"
      />
    );
  }
  if (participant.status === "absent") {
    return <Chip label="غیبت" color="error" size="small" variant="outlined" />;
  }
  if (participant.started_at) {
    return <Chip label="در حال انجام" color="warning" size="small" variant="outlined" />;
  }
  return <Chip label="ثبت‌نام شده" color="info" size="small" variant="outlined" />;
}

export function ScoreCells({
  participant,
  isDescriptive,
}: {
  participant: UserParticipant;
  isDescriptive: boolean;
}) {
  if (isDescriptive) {
    const numeric =
      participant.scaled_score != null
        ? String(participant.scaled_score)
        : participant.score !== null && participant.total_points !== null
          ? `${participant.score} / ${participant.total_points}`
          : "—";
    return (
      <>
        <Typography variant="body2">{numeric}</Typography>
        <Typography variant="body2">{participant.outcome_label || "—"}</Typography>
      </>
    );
  }
  return (
    <Typography variant="body2">
      {participant.score !== null && participant.total_points !== null
        ? `${participant.score} / ${participant.total_points}`
        : "—"}
    </Typography>
  );
}

export function SectionCard({
  title,
  icon,
  children,
  action,
  subtitle,
  noPadding,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  subtitle?: string;
  noPadding?: boolean;
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50"),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          {icon}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Stack>
      <Box sx={noPadding ? undefined : { p: 2 }}>{children}</Box>
    </Box>
  );
}
