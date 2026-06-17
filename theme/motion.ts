import type { SxProps, Theme } from "@mui/material/styles";
import type { TransitionProps } from "@mui/material/transitions";
import { shadows, motionTokens } from "@/theme/tokens";

export type MotionDurationKey = keyof typeof motionTokens.duration;

export function resolveMotionDuration(
  key: MotionDurationKey,
  reducedMotion?: boolean
): number {
  if (reducedMotion) return motionTokens.duration.instant;
  return motionTokens.duration[key];
}

export function motionTransition(
  properties: string | string[],
  durationKey: MotionDurationKey = "normal",
  reducedMotion?: boolean
): string {
  const duration = resolveMotionDuration(durationKey, reducedMotion);
  const props = Array.isArray(properties) ? properties.join(", ") : properties;
  return `${props} ${duration}ms ${motionTokens.easing}`;
}

export function getTransitionProps(
  durationKey: MotionDurationKey = "normal",
  reducedMotion?: boolean
): TransitionProps {
  const duration = resolveMotionDuration(durationKey, reducedMotion);
  return {
    timeout: { enter: duration, exit: Math.max(duration - 50, 0) },
  };
}

export function fadeInSx(
  reducedMotion?: boolean
): SxProps<Theme> {
  if (reducedMotion) return {};
  return {
    animation: `motionFadeIn ${motionTokens.duration.normal}ms ${motionTokens.easing} both`,
    "@keyframes motionFadeIn": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  };
}

export function pressableSx(reducedMotion?: boolean): SxProps<Theme> {
  if (reducedMotion) return {};
  return {
    transition: motionTransition("transform", "fast"),
    "&:active": {
      transform: "scale(0.97)",
    },
  };
}

export function hoverLiftSx(
  theme: Theme,
  reducedMotion?: boolean
): SxProps<Theme> {
  if (reducedMotion) {
    return {
      transition: motionTransition(["border-color", "box-shadow"], "normal"),
    };
  }
  return {
    transition: motionTransition(
      ["transform", "box-shadow", "border-color"],
      "slow"
    ),
    "&:hover": {
      transform: `translateY(-${motionTokens.distance.sm}px)`,
      boxShadow: shadows.elevatedSoft,
    },
  };
}

export function dialogTransitionProps(reducedMotion?: boolean): TransitionProps {
  return getTransitionProps("normal", reducedMotion);
}
