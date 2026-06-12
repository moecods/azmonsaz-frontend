"use client";

import type { ReactNode } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { ExamManageTab } from "@/lib/exam-manage-tabs";

export interface ExamManageNavItem {
  tab: ExamManageTab;
  label: string;
  icon: ReactNode;
  "data-cy"?: string;
}

interface ExamManageNavProps {
  items: ExamManageNavItem[];
  activeTab: ExamManageTab;
  onSelect: (tab: ExamManageTab) => void;
}

export function ExamManageNav({ items, activeTab, onSelect }: ExamManageNavProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
          mx: -0.5,
          px: 0.5,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((item) => {
          const selected = item.tab === activeTab;
          return (
            <Box
              key={item.tab}
              component="button"
              type="button"
              data-cy={item["data-cy"]}
              onClick={() => onSelect(item.tab)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
                px: 1.5,
                py: 1,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                borderRadius: 2,
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.1) : "background.paper",
                color: selected ? "primary.main" : "text.secondary",
                fontWeight: selected ? 700 : 500,
                fontSize: "0.875rem",
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              <Box sx={{ display: "flex", fontSize: 18, opacity: selected ? 1 : 0.7 }}>
                {item.icon}
              </Box>
              {item.label}
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box
      component="nav"
      aria-label="بخش‌های مدیریت آزمون"
      sx={{
        width: 220,
        flexShrink: 0,
        position: "sticky",
        top: theme.spacing(2),
        alignSelf: "flex-start",
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 1.5, mb: 0.5, display: "block", letterSpacing: 1 }}
      >
        بخش‌ها
      </Typography>
      <List disablePadding sx={{ bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "divider" }}>
        {items.map((item) => {
          const selected = item.tab === activeTab;
          return (
            <ListItemButton
              key={item.tab}
              selected={selected}
              onClick={() => onSelect(item.tab)}
              data-cy={item["data-cy"]}
              sx={{
                py: 1.25,
                borderBottom: 1,
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderInlineStart: 3,
                  borderInlineStartColor: "primary.main",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selected ? "primary.main" : "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { fontWeight: selected ? 700 : 500, fontSize: "0.9rem" },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

interface ExamManageLayoutProps {
  nav: ReactNode;
  children: ReactNode;
}

export function ExamManageLayout({ nav, children }: ExamManageLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {nav}
        <Box sx={{ minWidth: 0 }}>{children}</Box>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={3} alignItems="flex-start">
      {nav}
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}
