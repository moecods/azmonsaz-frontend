"use client";

import { useState } from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { APP_NAME_FA } from "@/components/auth/auth-layout";

const LOGO_SOURCES = {
  mark: "/brand/logo.png",
  withName: "/brand/logo-with-name.png",
  withNameAndSlogan: "/brand/logo-with-name-and-slogan.png",
} as const;

const logoBoxSx = {
  width: 52,
  height: 52,
  borderRadius: 2.5,
  bgcolor: "background.paper",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  flexShrink: 0,
} as const;

export interface AuthBrandLogoProps {
  /** When true, hide the mark entirely if the image fails to load */
  hideOnError?: boolean;
  variant?: keyof typeof LOGO_SOURCES;
}

/**
 * Brand mark on auth pages: logo image when available, School icon fallback on error.
 */
export default function AuthBrandLogo({
  hideOnError = false,
  variant = "mark",
}: AuthBrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = LOGO_SOURCES[variant];
  const isMarkVariant = variant === "mark";

  if (failed && hideOnError) {
    return null;
  }

  if (failed) {
    return (
      <Box sx={logoBoxSx} aria-hidden>
        <SchoolIcon sx={{ fontSize: 32, color: "primary.main" }} />
      </Box>
    );
  }

  if (!isMarkVariant) {
    return (
      <Box sx={{ width: { xs: 132, sm: variant === "withName" ? 158 : 178 }, flexShrink: 0 }}>
        <Image
          src={src}
          alt={APP_NAME_FA}
          width={356}
          height={356}
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
          priority
          onError={() => setFailed(true)}
        />
      </Box>
    );
  }

  return (
    <Box sx={logoBoxSx}>
      <Image
        src={src}
        alt={APP_NAME_FA}
        width={44}
        height={44}
        style={{ objectFit: "contain" }}
        priority
        onError={() => setFailed(true)}
      />
    </Box>
  );
}
