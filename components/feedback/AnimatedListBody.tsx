"use client";

import { type ReactNode } from "react";
import { Fade, TableBody } from "@mui/material";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motionTokens } from "@/theme/tokens";

interface AnimatedListBodyProps {
  children: ReactNode;
  /** Re-mount animation when data identity changes (e.g. page or filter key) */
  animationKey: string;
  /** Max staggered rows (avoid heavy animation on long lists) */
  maxStagger?: number;
}

export function AnimatedListBody({
  children,
  animationKey,
  maxStagger = 8,
}: AnimatedListBodyProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <TableBody>{children}</TableBody>;
  }

  return (
    <Fade in key={animationKey} timeout={motionTokens.duration.normal} appear>
      <TableBody>{children}</TableBody>
    </Fade>
  );
}

/** Opacity wrapper for non-table list content during pagination */
export function AnimatedContent({
  children,
  animationKey,
  loading,
}: {
  children: ReactNode;
  animationKey: string;
  loading?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Fade
      in={!loading}
      key={animationKey}
      timeout={reducedMotion ? 0 : motionTokens.duration.normal}
      appear
    >
      <div>{children}</div>
    </Fade>
  );
}
