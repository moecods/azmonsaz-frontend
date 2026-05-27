"use client";

import {
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PeopleIcon from "@mui/icons-material/People";
import { GroupAvatar } from "@/components/groups/GroupAvatar";

export interface GroupPickItem {
  id: number;
  name: string;
  description?: string | null;
  users_count?: number;
  avatar_url?: string | null;
}

interface GroupPickCardProps {
  group: GroupPickItem;
  variant: "select" | "attached";
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
}

export function GroupPickCard({
  group,
  variant,
  selected = false,
  disabled = false,
  compact = false,
  onSelect,
  onRemove,
}: GroupPickCardProps) {
  const theme = useTheme();
  const memberCount = group.users_count ?? 0;
  const avatarSize = compact ? 44 : 52;

  const borderColor =
    variant === "attached"
      ? "success.main"
      : selected
        ? "primary.main"
        : "divider";

  const bgcolor =
    variant === "attached"
      ? alpha(theme.palette.success.main, 0.06)
      : selected
        ? alpha(theme.palette.primary.main, 0.06)
        : "background.paper";

  const body = (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: "100%" }}>
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <GroupAvatar
          name={group.name}
          avatarUrl={group.avatar_url}
          sx={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: 2,
            fontSize: compact ? "1rem" : "1.2rem",
          }}
        />
        {variant === "select" && selected && (
          <CheckCircleIcon
            color="primary"
            sx={{
              position: "absolute",
              bottom: -4,
              insetInlineStart: -4,
              fontSize: 22,
              bgcolor: "background.paper",
              borderRadius: "50%",
            }}
          />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
        <Typography variant={compact ? "body2" : "subtitle2"} fontWeight={800} noWrap title={group.name}>
          {group.name}
        </Typography>
        {!compact && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mt: 0.25,
              lineHeight: 1.4,
            }}
          >
            {group.description?.trim() || "بدون توضیحات"}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
          <PeopleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption" fontWeight={600} color="text.primary">
            {memberCount.toLocaleString("fa-IR")} عضو
          </Typography>
        </Stack>
      </Box>
      {variant === "attached" && onRemove && (
        <IconButton
          size="small"
          color="error"
          aria-label={`حذف گروه ${group.name} از آزمون`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          sx={{ mt: -0.5 }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );

  if (variant === "attached") {
    return (
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor,
          bgcolor,
        }}
      >
        <Box sx={{ p: compact ? 1.25 : 1.5 }}>{body}</Box>
        <Box sx={{ px: 1.5, pb: 1 }}>
          <Chip label="در آزمون" size="small" color="success" variant="outlined" />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor,
        bgcolor,
        borderWidth: selected ? 2 : 1,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        "&:hover": disabled ? undefined : { boxShadow: 2 },
      }}
    >
      <CardActionArea
        disabled={disabled}
        onClick={onSelect}
        sx={{ p: compact ? 1.25 : 1.5, alignItems: "stretch" }}
      >
        {body}
      </CardActionArea>
    </Card>
  );
}
