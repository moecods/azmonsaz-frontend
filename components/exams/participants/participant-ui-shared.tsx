"use client";

import type { ReactNode } from "react";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
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

export function ParticipantNameCell({
  user,
  compact,
}: {
  user: ExamUser | null | undefined;
  compact?: boolean;
}) {
  const name = user?.name || "—";
  const email = user?.email;
  const nationalId = user?.national_id;
  if (compact || (!email && !nationalId)) {
    return (
      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "100%" }}>
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

type StatusTone = "success" | "error" | "warning" | "info" | "default";

function getParticipantStatus(participant: UserParticipant): { label: string; tone: StatusTone } {
  if (participant.completed_at) {
    return participant.passed
      ? { label: "قبول", tone: "success" }
      : { label: "رد", tone: "error" };
  }
  if (participant.status === "absent") return { label: "غیبت", tone: "error" };
  if (participant.started_at) return { label: "در حال انجام", tone: "warning" };
  return { label: "ثبت‌نام", tone: "info" };
}

export function ParticipantStatusBadge({ participant }: { participant: UserParticipant }) {
  const theme = useTheme();
  const { label, tone } = getParticipantStatus(participant);
  const color =
    tone === "default" ? theme.palette.text.secondary : theme.palette[tone].main;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1,
        py: 0.35,
        borderRadius: 10,
        bgcolor: alpha(color, 0.1),
        color,
        flexShrink: 0,
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography variant="caption" fontWeight={700} lineHeight={1.2}>
        {label}
      </Typography>
    </Box>
  );
}

/** @deprecated Use ParticipantStatusBadge */
export function ParticipantStatusChip({ participant }: { participant: UserParticipant }) {
  return <ParticipantStatusBadge participant={participant} />;
}

export function formatParticipantScore(
  participant: UserParticipant,
  isDescriptive: boolean
): { primary: string; secondary?: string } {
  if (isDescriptive) {
    const numeric =
      participant.scaled_score != null
        ? String(participant.scaled_score)
        : participant.score !== null && participant.total_points !== null
          ? `${participant.score}/${participant.total_points}`
          : "—";
    const label = participant.outcome_label;
    return label ? { primary: numeric, secondary: label } : { primary: numeric };
  }
  if (participant.score !== null && participant.total_points !== null) {
    return { primary: `${participant.score}/${participant.total_points}` };
  }
  return { primary: "—" };
}

export function ScoreCells({
  participant,
  isDescriptive,
}: {
  participant: UserParticipant;
  isDescriptive: boolean;
}) {
  const score = formatParticipantScore(participant, isDescriptive);
  if (isDescriptive && score.secondary) {
    return (
      <>
        <Typography variant="body2">{score.primary}</Typography>
        <Typography variant="body2">{score.secondary}</Typography>
      </>
    );
  }
  return <Typography variant="body2">{score.primary}</Typography>;
}

export function ManageSectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="space-between"
      spacing={1}
      sx={{ mb: { xs: 1, sm: 1.5 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.35 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

/** Bordered content area without header bar (tables, lists). */
export function ContentPanel({
  children,
  noPadding,
}: {
  children: ReactNode;
  noPadding?: boolean;
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        ...(noPadding ? undefined : { p: { xs: 1.5, sm: 2 } }),
      }}
    >
      {children}
    </Box>
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
