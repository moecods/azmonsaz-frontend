"use client";

import {
  Box,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ParticipantActionsMenu } from "@/components/exams/participants/ParticipantActionsMenu";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import UserAvatar from "@/components/ui/UserAvatar";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";
import {
  ParticipantStatusBadge,
  formatParticipantScore,
} from "@/components/exams/participants/participant-ui-shared";
import { participantGridColumns } from "@/components/exams/participants/participant-grid-columns";

interface ParticipantRowProps {
  examId?: number;
  participant: UserParticipant;
  isDescriptiveGrading: boolean;
  groupAvatarById?: Map<number, string | null | undefined>;
  canManageParticipants?: boolean;
  onRemoveParticipant?: (participant: UserParticipant) => void;
  showGroup?: boolean;
  isLast?: boolean;
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatShortTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GroupCell({
  participant,
  groupAvatarById,
}: {
  participant: UserParticipant;
  groupAvatarById?: Map<number, string | null | undefined>;
}) {
  if (!participant.group) {
    return (
      <Typography variant="body2" color="text.disabled">
        بدون گروه
      </Typography>
    );
  }

  const name = participant.group.name;
  return (
    <Tooltip title={name} placement="top">
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{ minWidth: 0, maxWidth: { lg: 200, xl: 260 } }}
      >
        <GroupAvatar
          name={name}
          avatarUrl={
            participant.group.avatar_url ?? groupAvatarById?.get(participant.group.id)
          }
          sx={{ width: 28, height: 28, borderRadius: 1.25, fontSize: "0.75rem", flexShrink: 0 }}
        />
        <Typography variant="body2" fontWeight={600} noWrap sx={{ minWidth: 0 }}>
          {name}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function ContactCell({ participant, inline }: { participant: UserParticipant; inline?: boolean }) {
  const user = participant.user;
  const phone = user?.phone_number;
  const nationalId = user?.national_id;

  if (inline && (phone || nationalId)) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {phone && (
          <Stack direction="row" spacing={0.4} alignItems="center">
            <PhoneOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" dir="ltr">
              {phone}
            </Typography>
          </Stack>
        )}
        {nationalId && (
          <Stack direction="row" spacing={0.4} alignItems="center">
            <BadgeOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" dir="ltr">
              {nationalId}
            </Typography>
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.35} sx={{ minWidth: 0 }}>
      {phone && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
          <PhoneOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
          <Typography variant="body2" noWrap dir="ltr" sx={{ textAlign: "right" }}>
            {phone}
          </Typography>
        </Stack>
      )}
      {nationalId && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
          <BadgeOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" noWrap dir="ltr">
            {nationalId}
          </Typography>
        </Stack>
      )}
      {!phone && !nationalId && (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      )}
    </Stack>
  );
}

function MobileStatBox({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: 1,
        borderColor: "divider",
        minWidth: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.35 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
        {value}
      </Typography>
      {subValue && (
        <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.25 }}>
          {subValue}
        </Typography>
      )}
    </Box>
  );
}

function MobileGroupBar({
  participant,
  groupAvatarById,
}: {
  participant: UserParticipant;
  groupAvatarById?: Map<number, string | null | undefined>;
}) {
  const theme = useTheme();
  if (!participant.group) {
    return (
      <Typography variant="caption" color="text.disabled">
        بدون گروه
      </Typography>
    );
  }
  const name = participant.group.name;
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.25,
        py: 0.85,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.12),
        minWidth: 0,
      }}
    >
      <GroupAvatar
        name={name}
        avatarUrl={
          participant.group.avatar_url ?? groupAvatarById?.get(participant.group.id)
        }
        sx={{ width: 26, height: 26, borderRadius: 1.25, fontSize: "0.7rem", flexShrink: 0 }}
      />
      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0, wordBreak: "break-word" }}>
        {name}
      </Typography>
    </Stack>
  );
}

function CompactTimeCell({ participant }: { participant: UserParticipant }) {
  const start = participant.started_at;
  const end = participant.completed_at;
  const fullTooltip = [
    start ? `شروع: ${formatShortDate(start)} ${formatShortTime(start)}` : null,
    end ? `پایان: ${formatShortDate(end)} ${formatShortTime(end)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!start && !end) {
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Tooltip title={fullTooltip} placement="top">
      <Stack spacing={0.2} sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          ش: {formatShortDate(start)}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          پ: {formatShortDate(end)}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function StudentCell({ participant }: { participant: UserParticipant }) {
  const user = participant.user;
  const phone = user?.phone_number;
  const nationalId = user?.national_id;
  const meta = [phone, nationalId].filter(Boolean).join(" · ");

  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <UserAvatar
        name={user?.name ?? "?"}
        sx={{ width: 40, height: 40, fontSize: "0.85rem", flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap title={user?.name ?? ""}>
          {user?.name ?? "—"}
        </Typography>
        {meta ? (
          <Typography variant="caption" color="text.secondary" noWrap dir="ltr" sx={{ display: "block", textAlign: "right" }}>
            {meta}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export function ParticipantRow({
  examId,
  participant,
  isDescriptiveGrading,
  groupAvatarById,
  canManageParticipants,
  onRemoveParticipant,
  showGroup = true,
  isLast,
}: ParticipantRowProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const score = formatParticipantScore(participant, isDescriptiveGrading);
  const showActions = Boolean(canManageParticipants && onRemoveParticipant);
  const gridTemplate = participantGridColumns({
    showGroup,
    isDescriptiveGrading,
    showActions,
  });

  if (isDesktop) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: gridTemplate,
          gap: 1.5,
          alignItems: "center",
          px: 2,
          py: 1.25,
          borderBottom: isLast ? 0 : 1,
          borderColor: "divider",
          transition: "background-color 0.12s ease",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            "& .participant-row-actions": { opacity: 1 },
          },
        }}
      >
        {/* Student + contact */}
        <StudentCell participant={participant} />

        {showGroup && <GroupCell participant={participant} groupAvatarById={groupAvatarById} />}

        <Typography variant="body2" fontWeight={700} textAlign="center" noWrap>
          {score.primary}
        </Typography>

        {isDescriptiveGrading && (
          <Typography variant="caption" textAlign="center" color="text.secondary" noWrap>
            {score.secondary ?? "—"}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
          <ParticipantStatusBadge participant={participant} />
        </Box>

        <CompactTimeCell participant={participant} />

        {showActions && examId && (
          <Box className="participant-row-actions" sx={{ opacity: 0, transition: "opacity 0.12s" }}>
            <ParticipantActionsMenu
              examId={examId}
              participant={participant}
              onRemove={onRemoveParticipant}
            />
          </Box>
        )}
      </Box>
    );
  }

  /* Mobile card */
  const scoreLabel = score.secondary ? `${score.primary} · ${score.secondary}` : score.primary;
  const startDate = formatShortDate(participant.started_at);
  const startTime = formatShortTime(participant.started_at);
  const endDate = formatShortDate(participant.completed_at);
  const endTime = formatShortTime(participant.completed_at);

  return (
    <Box
      sx={{
        mx: 1,
        mb: isLast ? 0 : 1,
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (t) =>
          t.palette.mode === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <UserAvatar
            name={participant.user?.name ?? "?"}
            sx={{ width: 44, height: 44, fontSize: "0.9rem", flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.35 }}>
                {participant.user?.name ?? "—"}
              </Typography>
              {showActions && examId && (
                <ParticipantActionsMenu
                  examId={examId}
                  participant={participant}
                  onRemove={onRemoveParticipant}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              <ParticipantStatusBadge participant={participant} />
              <ContactCell participant={participant} inline />
            </Stack>
          </Box>
        </Stack>

        {showGroup && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
              گروه
            </Typography>
            <MobileGroupBar participant={participant} groupAvatarById={groupAvatarById} />
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.75,
          }}
        >
          <MobileStatBox label="نمره" value={scoreLabel} />
          <MobileStatBox
            label="شروع"
            value={startDate}
            subValue={startTime || undefined}
          />
          <MobileStatBox
            label="پایان"
            value={endDate}
            subValue={endTime || undefined}
          />
        </Box>
      </Stack>
    </Box>
  );
}
