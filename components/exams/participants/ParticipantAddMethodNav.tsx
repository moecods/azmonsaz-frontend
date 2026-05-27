"use client";

import type { ReactElement } from "react";
import {
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";
import type { ParticipantAddMethod } from "@/components/exams/participants/participant-ui-shared";
import { PARTICIPANT_ADD_METHODS } from "@/components/exams/participants/participant-ui-shared";

interface ParticipantAddMethodNavProps {
  value: ParticipantAddMethod;
  onChange: (method: ParticipantAddMethod) => void;
  layout?: "drawer" | "inline" | "sheet";
}

export function ParticipantAddMethodNav({
  value,
  onChange,
  layout = "inline",
}: ParticipantAddMethodNavProps) {
  const theme = useTheme();

  if (layout === "sheet") {
    return (
      <Box
        component="nav"
        aria-label="روش افزودن شرکت‌کننده"
        sx={{
          display: "flex",
          gap: 0.75,
          overflowX: "auto",
          pb: 0.5,
          mx: -0.5,
          px: 0.5,
          flexShrink: 0,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {PARTICIPANT_ADD_METHODS.map((m) => {
          const selected = value === m.value;
          return (
            <Chip
              key={m.value}
              icon={m.icon as ReactElement}
              label={m.label}
              clickable
              onClick={() => onChange(m.value)}
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              sx={{
                flexShrink: 0,
                fontWeight: selected ? 700 : 500,
                "& .MuiChip-icon": { color: selected ? "inherit" : "text.secondary" },
              }}
            />
          );
        })}
      </Box>
    );
  }

  return (
    <List
      disablePadding
      aria-label="روش افزودن شرکت‌کننده"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        ...(layout === "inline" ? { width: { md: 200 }, flexShrink: 0 } : {}),
      }}
    >
      {PARTICIPANT_ADD_METHODS.map((m) => {
        const selected = value === m.value;
        return (
          <ListItemButton
            key={m.value}
            selected={selected}
            onClick={() => onChange(m.value)}
            sx={{
              borderRadius: 2,
              border: 1,
              borderColor: selected ? "primary.main" : "divider",
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
              py: 1.25,
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: selected ? "primary.main" : "text.secondary" }}>
              {m.icon}
            </ListItemIcon>
            <ListItemText
              primary={m.label}
              secondary={layout === "drawer" ? m.description : undefined}
              primaryTypographyProps={{ fontWeight: 700, variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption", sx: { mt: 0.25 } }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}
