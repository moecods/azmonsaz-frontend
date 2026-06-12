"use client";

import { Box } from "@mui/material";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}
