"use client";

import { Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export type ExamsViewMode = "list" | "calendar";

interface ExamsListToolbarProps {
  viewMode: ExamsViewMode;
  onViewModeChange: (mode: ExamsViewMode) => void;
  onCreate: () => void;
  showPaginationHint?: boolean;
  pageInfo?: string;
}

export function ExamsListToolbar({
  viewMode,
  onViewModeChange,
  onCreate,
  showPaginationHint,
  pageInfo,
}: ExamsListToolbarProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="space-between"
    >
      <ToggleButtonGroup
        size="small"
        exclusive
        value={viewMode}
        onChange={(_, value: ExamsViewMode | null) => {
          if (value) onViewModeChange(value);
        }}
        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
      >
        <ToggleButton value="list">
          <ViewListIcon fontSize="small" sx={{ me: 0.5 }} />
          لیست
        </ToggleButton>
        <ToggleButton value="calendar">
          <CalendarMonthIcon fontSize="small" sx={{ me: 0.5 }} />
          تقویم
        </ToggleButton>
      </ToggleButtonGroup>

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" flexWrap="wrap">
        {showPaginationHint && pageInfo && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
            {pageInfo}
          </Typography>
        )}
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onCreate}>
          آزمون جدید
        </Button>
      </Stack>
    </Stack>
  );
}
