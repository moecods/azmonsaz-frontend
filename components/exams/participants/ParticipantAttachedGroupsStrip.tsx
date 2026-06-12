"use client";

import { Stack, Typography } from "@mui/material";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";

interface ParticipantAttachedGroupsStripProps {
  groups: GroupPickItem[];
}

export function ParticipantAttachedGroupsStrip({ groups }: ParticipantAttachedGroupsStripProps) {
  if (groups.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        گروه‌های متصل
      </Typography>
      {groups.map((g) => (
        <Stack
          key={g.id}
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{
            px: 1.25,
            py: 0.6,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            transition: "border-color 0.12s ease",
            "&:hover": { borderColor: "primary.light" },
          }}
        >
          <GroupAvatar
            name={g.name}
            avatarUrl={g.avatar_url}
            sx={{ width: 24, height: 24, borderRadius: 1.25, fontSize: "0.7rem" }}
          />
          <Typography variant="caption" fontWeight={700}>
            {g.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(g.users_count ?? 0).toLocaleString("fa-IR")} نفر
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
