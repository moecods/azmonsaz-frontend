"use client";

import { type ReactNode } from "react";
import { Fade } from "@mui/material";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getTransitionProps } from "@/theme/motion";

interface PageContentFadeProps {
  children: ReactNode;
  /** Change when route segment changes to re-trigger fade */
  contentKey: string;
}

export function PageContentFade({ children, contentKey }: PageContentFadeProps) {
  const reducedMotion = useReducedMotion();
  const transition = getTransitionProps("normal", reducedMotion);

  return (
    <Fade in key={contentKey} timeout={transition.timeout} appear>
      <div style={{ minHeight: 0 }}>{children}</div>
    </Fade>
  );
}
