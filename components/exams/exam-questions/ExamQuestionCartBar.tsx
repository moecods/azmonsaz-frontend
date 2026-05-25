"use client";

import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Slide,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  DESKTOP_SHELL_PADDING_X,
  MOBILE_FLOATING_BOTTOM_OFFSET,
  MOBILE_SHELL_PADDING_X,
  SIDEBAR_WIDTH,
} from "@/components/layout/layout-constants";

/** Reserve space below scrollable content when cart bar is visible. */
export const EXAM_QUESTION_CART_BAR_RESERVE_PX = 120;

export interface ExamQuestionCartBarProps {
  visible: boolean;
  count: number;
  isCommitting: boolean;
  commitProgress: { current: number; total: number } | null;
  onCommit: () => void;
  onClear: () => void;
}

export function ExamQuestionCartBar({
  visible,
  count,
  isCommitting,
  commitProgress,
  onCommit,
  onClear,
}: ExamQuestionCartBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const showBar = visible && count > 0;

  return (
    <Slide direction="up" in={showBar} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        role="region"
        aria-label="سبد انتخاب سوالات از بانک"
        sx={{
          position: "fixed",
          bottom: isMobile
            ? `calc(${MOBILE_FLOATING_BOTTOM_OFFSET + 12}px + env(safe-area-inset-bottom, 0px))`
            : 20,
          zIndex: theme.zIndex.drawer + 2,
          insetInlineStart: isMobile
            ? MOBILE_SHELL_PADDING_X
            : SIDEBAR_WIDTH + DESKTOP_SHELL_PADDING_X,
          insetInlineEnd: isMobile ? MOBILE_SHELL_PADDING_X : DESKTOP_SHELL_PADDING_X,
          width: isMobile
            ? "auto"
            : `min(1280px, calc(100vw - ${SIDEBAR_WIDTH}px - ${DESKTOP_SHELL_PADDING_X * 2}px))`,
          maxWidth: 1280,
          mx: "auto",
          borderRadius: { xs: 3, md: 2 },
          overflow: "hidden",
          border: "1px solid",
          borderColor: "primary.light",
          bgcolor: "background.paper",
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.16)",
        }}
      >
        {isCommitting && (
          <LinearProgress
            variant={commitProgress ? "determinate" : "indeterminate"}
            value={
              commitProgress && commitProgress.total > 0
                ? (commitProgress.current / commitProgress.total) * 100
                : undefined
            }
            color="primary"
            sx={{ height: 3 }}
          />
        )}

        {isMobile ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Stack spacing={1.25}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShoppingCartIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
                  {count.toLocaleString("fa-IR")} سوال در سبد
                </Typography>
                <IconButton
                  size="small"
                  aria-label="پاک کردن سبد"
                  onClick={onClear}
                  disabled={isCommitting}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              {isCommitting && commitProgress && (
                <Typography variant="caption" color="text.secondary">
                  در حال افزودن {commitProgress.current.toLocaleString("fa-IR")} از{" "}
                  {commitProgress.total.toLocaleString("fa-IR")}…
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={onCommit}
                disabled={isCommitting || count === 0}
                sx={{ fontWeight: 700, py: 1.1 }}
              >
                {isCommitting ? "در حال افزودن…" : "افزودن به آزمون"}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2, py: 1.25, minHeight: 56 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <ShoppingCartIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                {count.toLocaleString("fa-IR")} سوال در سبد
              </Typography>
            </Stack>

            {isCommitting && commitProgress ? (
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                در حال افزودن {commitProgress.current.toLocaleString("fa-IR")} از{" "}
                {commitProgress.total.toLocaleString("fa-IR")}…
              </Typography>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Button
                variant="text"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={onClear}
                disabled={isCommitting}
              >
                پاک کردن سبد
              </Button>
              <Button
                variant="contained"
                onClick={onCommit}
                disabled={isCommitting || count === 0}
                sx={{ fontWeight: 700, px: 2.5, whiteSpace: "nowrap" }}
              >
                افزودن به آزمون
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Slide>
  );
}
