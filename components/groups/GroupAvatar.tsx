"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Box, type AvatarProps } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

/** Consistent gradient palettes when the group has no custom image */
const GROUP_AVATAR_PALETTES: ReadonlyArray<{ from: string; to: string }> = [
  { from: "#5C6BC0", to: "#3949AB" },
  { from: "#26A69A", to: "#00897B" },
  { from: "#7E57C2", to: "#5E35B1" },
  { from: "#42A5F5", to: "#1E88E5" },
  { from: "#EC407A", to: "#D81B60" },
  { from: "#FFA726", to: "#F57C00" },
  { from: "#66BB6A", to: "#43A047" },
  { from: "#8D6E63", to: "#6D4C41" },
];

function paletteForName(name: string): { from: string; to: string } {
  const key = name.trim() || "group";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GROUP_AVATAR_PALETTES[Math.abs(hash) % GROUP_AVATAR_PALETTES.length]!;
}

export interface GroupAvatarProps extends Omit<AvatarProps, "src" | "children"> {
  name: string;
  avatarUrl?: string | null;
  previewSrc?: string | null;
}

function GroupAvatarPlaceholder({ name, sx }: { name: string; sx?: AvatarProps["sx"] }) {
  const palette = useMemo(() => paletteForName(name), [name]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.to} 100%)`,
        ...sx,
      }}
    >
      <GroupsIcon
        sx={{
          width: "52%",
          height: "52%",
          color: "common.white",
          opacity: 0.92,
        }}
      />
    </Box>
  );
}

export function GroupAvatar({
  name,
  avatarUrl,
  previewSrc,
  sx,
  ...rest
}: GroupAvatarProps) {
  const resolved = previewSrc ?? resolveMediaUrl(avatarUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  const showImage = Boolean(resolved) && !failed;

  return (
    <Avatar
      {...rest}
      src={showImage ? resolved : undefined}
      imgProps={{
        onError: () => setFailed(true),
        loading: "lazy",
        ...rest.imgProps,
      }}
      variant={rest.variant ?? "rounded"}
      sx={{
        overflow: "hidden",
        bgcolor: "transparent",
        ...sx,
      }}
    >
      {!showImage && <GroupAvatarPlaceholder name={name} />}
    </Avatar>
  );
}
