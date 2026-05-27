"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import type { ReactNode } from "react";

interface QuestionBankFiltersPanelProps {
  children: ReactNode;
  loadedCount?: number;
  totalCount?: number;
  isRefetching?: boolean;
  title?: string;
  /** Below lg: same filter card collapsed in an accordion (list pages) */
  collapsibleOnMobile?: boolean;
  defaultExpanded?: boolean;
}

export function QuestionBankFiltersPanel({
  children,
  loadedCount,
  totalCount,
  isRefetching = false,
  title = "فیلترها",
  collapsibleOnMobile = true,
  defaultExpanded = false,
}: QuestionBankFiltersPanelProps) {
  const theme = useTheme();
  const hasProgress = totalCount != null && totalCount > 0;

  const headerSx = {
    px: 2,
    py: 1.25,
    borderBottom: "1px solid",
    borderColor: "divider",
    bgcolor: alpha(theme.palette.primary.main, 0.04),
    display: "flex",
    alignItems: "center",
    gap: 1,
  } as const;

  const headerContent = (
    <>
      <TuneIcon fontSize="small" color="primary" />
      <Typography variant="subtitle2" fontWeight={700}>
        {title}
      </Typography>
    </>
  );

  const body = (
    <>
      <Stack spacing={2}>{children}</Stack>
      {hasProgress && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              بارگذاری شده
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {(loadedCount ?? 0).toLocaleString("fa-IR")} / {totalCount.toLocaleString("fa-IR")}
            </Typography>
          </Stack>
          {isRefetching && (
            <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: "block" }}>
              در حال به‌روزرسانی…
            </Typography>
          )}
        </Box>
      )}
    </>
  );

  const cardSx = {
    borderRadius: 2.5,
    overflow: "hidden",
    bgcolor: alpha(theme.palette.background.paper, 0.9),
  } as const;

  const desktopCard = (
    <Card variant="outlined" sx={cardSx}>
      <Box sx={headerSx}>{headerContent}</Box>
      <CardContent sx={{ pt: 2, "&:last-child": { pb: 2 } }}>{body}</CardContent>
    </Card>
  );

  const mobileAccordion = (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        ...cardSx,
        border: "1px solid",
        borderColor: "divider",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          ...headerSx,
          minHeight: 48,
          "&.Mui-expanded": { minHeight: 48 },
          "& .MuiAccordionSummary-content": { my: 1, alignItems: "center" },
        }}
      >
        {headerContent}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>{body}</AccordionDetails>
    </Accordion>
  );

  if (!collapsibleOnMobile) {
    return desktopCard;
  }

  return (
    <>
      <Box sx={{ display: { xs: "block", lg: "none" } }}>{mobileAccordion}</Box>
      <Box sx={{ display: { xs: "none", lg: "block" } }}>{desktopCard}</Box>
    </>
  );
}
