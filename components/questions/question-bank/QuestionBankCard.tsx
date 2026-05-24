"use client";

import { Box, Card, CardContent, Stack, type SxProps, type Theme } from "@mui/material";
import { questionTypeBorderSx } from "@/lib/question-types/type-appearance";
import type { ReactNode } from "react";

interface QuestionBankCardProps {
  questionType: string;
  meta: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  sx?: SxProps<Theme>;
  selected?: boolean;
  muted?: boolean;
}

export function QuestionBankCard({
  questionType,
  meta,
  children,
  actions,
  sx,
  selected = false,
  muted = false,
}: QuestionBankCardProps) {
  return (
    <Card
      variant="outlined"
      sx={(t) => ({
        overflow: "visible",
        borderRadius: 2.5,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
        opacity: muted ? 0.78 : 1,
        ...questionTypeBorderSx(t, questionType),
        ...(selected
          ? {
              bgcolor: "action.selected",
              borderColor: "primary.main",
              boxShadow: `0 0 0 1px ${t.palette.primary.main}`,
            }
          : {}),
        "&:hover": {
          boxShadow: muted ? 0 : 2,
          transform: muted ? undefined : "translateY(-1px)",
        },
        ...((typeof sx === "function" ? sx(t) : sx) as object),
      })}
    >
      <CardContent
        sx={{
          position: "relative",
          py: 2,
          px: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: 2 },
          ...(actions ? { pe: { xs: 7, sm: 9 } } : {}),
        }}
      >
        {meta}
        <Box sx={{ minWidth: 0 }}>{children}</Box>
        {actions && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: "absolute",
              top: 12,
              insetInlineEnd: 12,
              zIndex: 1,
            }}
          >
            {actions}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
