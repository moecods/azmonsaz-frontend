"use client";

import type { ReactNode } from "react";
import {
  Box,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export function FormStepSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50"),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {icon && (
            <Box sx={{ color: "primary.main", mt: 0.25, display: "flex" }}>{icon}</Box>
          )}
          <Box>
            <Typography variant="subtitle2" fontWeight={800}>
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

export function SelectableOptionCard({
  selected,
  onClick,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        textAlign: "start",
        width: "100%",
        p: 1.75,
        border: 2,
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 2,
        cursor: "pointer",
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
        transition: "border-color 0.2s, background-color 0.2s",
        "&:hover": {
          borderColor: selected ? "primary.main" : alpha(theme.palette.primary.main, 0.4),
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: selected ? "primary.main" : "text.secondary", display: "flex" }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {title}
            </Typography>
            {selected && (
              <CheckCircleIcon sx={{ fontSize: 18, color: "primary.main" }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
