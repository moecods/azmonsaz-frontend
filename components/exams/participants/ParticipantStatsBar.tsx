"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import type { ParticipantListStats } from "@/lib/participant-list-stats";

interface ParticipantStatsBarProps {
  stats: ParticipantListStats;
  activeFilter: string;
  onFilterClick: (filter: "all" | "registered" | "in_progress" | "completed" | "absent") => void;
}

const STAT_ITEMS = [
  { key: "all" as const, label: "کل", field: "total" as const, icon: PeopleIcon, tone: "primary" as const },
  { key: "registered" as const, label: "ثبت‌نام", field: "registered" as const, icon: HowToRegIcon, tone: "info" as const },
  { key: "in_progress" as const, label: "در حال انجام", field: "inProgress" as const, icon: PlayCircleOutlineIcon, tone: "warning" as const },
  { key: "completed" as const, label: "پایان‌یافته", field: "completed" as const, icon: CheckCircleOutlineIcon, tone: "success" as const },
];

export function ParticipantStatsBar({ stats, activeFilter, onFilterClick }: ParticipantStatsBarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
        gap: 1,
      }}
    >
      {STAT_ITEMS.map(({ key, label, field, icon: Icon, tone }) => {
        const value = stats[field];
        const selected = activeFilter === key;
        const color = theme.palette[tone].main;

        return (
          <Box
            key={key}
            component="button"
            type="button"
            onClick={() => onFilterClick(key)}
            aria-pressed={selected}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: { xs: 1.25, sm: 1.5 },
              border: "1px solid",
              borderColor: selected ? alpha(color, 0.45) : "divider",
              borderRadius: 2.5,
              bgcolor: selected ? alpha(color, 0.08) : "background.paper",
              cursor: "pointer",
              textAlign: "right",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: alpha(color, 0.35),
                bgcolor: alpha(color, 0.06),
                transform: "translateY(-1px)",
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                bgcolor: alpha(color, 0.12),
                color,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                lineHeight={1.1}
                color={selected ? `${tone}.main` : "text.primary"}
              >
                {value.toLocaleString("fa-IR")}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
