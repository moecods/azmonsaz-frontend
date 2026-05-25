"use client";

import { useState } from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { APP_NAME_FA } from "@/components/auth/auth-layout";

export const AUTH_BRAND_LOGO_SRC = "/brand/azmonsaz-logo.png";

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
}

/**
 * Brand mark on auth pages: logo image when available, School icon fallback on error.
 */
export default function AuthBrandLogo({ hideOnError = false }: AuthBrandLogoProps) {
  const [failed, setFailed] = useState(false);

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

  return (
    <Box sx={logoBoxSx}>
      <Image
        src={AUTH_BRAND_LOGO_SRC}
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
