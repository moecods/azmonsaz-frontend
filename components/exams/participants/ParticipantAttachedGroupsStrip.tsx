"use client";

import { Box, Stack, Typography } from "@mui/material";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";

interface ParticipantAttachedGroupsStripProps {
  groups: GroupPickItem[];
}

/** Compact inline row — not a page hero */
export function ParticipantAttachedGroupsStrip({ groups }: ParticipantAttachedGroupsStripProps) {
  if (groups.length === 0) return null;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50"),
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.75, display: "block" }}>
        گروه‌های متصل ({groups.length.toLocaleString("fa-IR")})
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: "auto",
          pb: 0.25,
          "&::-webkit-scrollbar": { height: 4 },
        }}
      >
        {groups.map((g) => (
          <Stack
            key={g.id}
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              flexShrink: 0,
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
            }}
          >
            <GroupAvatar
              name={g.name}
              avatarUrl={g.avatar_url}
              sx={{ width: 28, height: 28, borderRadius: 1.5, fontSize: "0.75rem" }}
            />
            <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
              {g.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({(g.users_count ?? 0).toLocaleString("fa-IR")})
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
