"use client";

import type { ReactNode } from "react";
import { Box, alpha } from "@mui/material";
import type { ParticipantGridOptions } from "@/components/exams/participants/participant-grid-columns";
import { participantTableMinWidth } from "@/components/exams/participants/participant-grid-columns";

interface ParticipantDesktopTableProps {
  gridOptions: ParticipantGridOptions;
  children: ReactNode;
  embedded?: boolean;
}

export function ParticipantDesktopTable({
  gridOptions,
  children,
  embedded = false,
}: ParticipantDesktopTableProps) {
  const minWidth = participantTableMinWidth(gridOptions);

  const inner = (
    <Box sx={{ minWidth, width: "100%" }}>{children}</Box>
  );

  if (embedded) {
    return (
      <Box sx={{ overflowX: "auto", minWidth: 0, WebkitOverflowScrolling: "touch" }}>
        {inner}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          // subtle scroll hint on the inline-start edge
          background: (t) =>
            `linear-gradient(to left, ${alpha(t.palette.primary.main, 0.04)}, transparent 12px)`,
        }}
      >
        {inner}
      </Box>
    </Box>
  );
}
