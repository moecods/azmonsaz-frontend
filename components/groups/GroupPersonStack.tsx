"use client";

import { Box, Tooltip, Typography } from "@mui/material";
import UserAvatar from "@/components/ui/UserAvatar";

export interface GroupPersonStackItem {
  id: number;
  name: string;
  avatar_url?: string | null;
}

interface GroupPersonStackProps {
  people: GroupPersonStackItem[];
  maxVisible?: number;
  size?: number;
  /** When set (e.g. total members), overflow chip uses totalCount − visible instead of preview length only */
  totalCount?: number;
  overflowLabel?: (remaining: number) => string;
}

export function GroupPersonStack({
  people,
  maxVisible = 5,
  size = 32,
  totalCount,
  overflowLabel = (n) => `+${n.toLocaleString("fa-IR")}`,
}: GroupPersonStackProps) {
  if (people.length === 0) return null;

  const visible = people.slice(0, maxVisible);
  const remaining =
    totalCount != null
      ? Math.max(0, totalCount - visible.length)
      : people.length - visible.length;
  const overlap = Math.round(size * 0.28);

  return (
    <Box sx={{ display: "flex", alignItems: "center", minHeight: size }}>
      {visible.map((person, index) => (
        <Tooltip key={person.id} title={person.name} arrow>
          <UserAvatar
            name={person.name}
            avatarUrl={person.avatar_url}
            sx={{
              width: size,
              height: size,
              fontSize: size * 0.38,
              border: 2,
              borderColor: "background.paper",
              ml: index === 0 ? 0 : `-${overlap}px`,
              zIndex: visible.length - index,
            }}
          />
        </Tooltip>
      ))}
      {remaining > 0 && (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            ml: `-${overlap}px`,
            bgcolor: "action.hover",
            border: 2,
            borderColor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 0,
          }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: size * 0.32 }}>
            {overflowLabel(remaining)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
