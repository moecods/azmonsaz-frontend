"use client";

import { useEffect, type ReactNode } from "react";
import { Box } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { useColorMode, type ColorMode } from "@/theme/ColorModeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ColorModeSync({ mode }: { mode: ColorMode }) {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(mode);
  }, [mode, setColorMode]);

  return null;
}

export function StorybookDecorator({
  children,
  colorMode = "light",
}: {
  children: ReactNode;
  colorMode?: ColorMode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeRegistry>
        <ColorModeSync mode={colorMode} />
        <Box
          dir="rtl"
          lang="fa"
          sx={{
            minHeight: 120,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            fontFamily: "'Vazirmatn', 'Roboto', 'Arial', sans-serif",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          {children}
        </Box>
      </ThemeRegistry>
    </QueryClientProvider>
  );
}
