"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarProps } from "@mui/material";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface UserAvatarProps extends Omit<AvatarProps, "src" | "children"> {
  name?: string | null;
  avatarUrl?: string | null;
  /** Optional local preview (blob URL) while uploading */
  previewSrc?: string | null;
}

/**
 * Avatar with resolved media URL and fallback to initials when the image fails to load.
 */
export default function UserAvatar({
  name,
  avatarUrl,
  previewSrc,
  sx,
  ...rest
}: UserAvatarProps) {
  const resolved = previewSrc ?? resolveMediaUrl(avatarUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  const showImage = Boolean(resolved) && !failed;
  const initials = name ? getInitials(name) : "?";

  return (
    <Avatar
      {...rest}
      src={showImage ? resolved : undefined}
      imgProps={{
        onError: () => setFailed(true),
        loading: "lazy",
        referrerPolicy: "no-referrer",
        ...rest.imgProps,
      }}
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontWeight: 700,
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
}
