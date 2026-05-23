"use client";

import { Box, Card, CardActionArea, Chip, Stack, Typography, alpha } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import type { DashboardAction } from "@/lib/student-dashboard";
import { useRouter } from "next/navigation";

const kindIcon = {
  continue_exam: PlayArrowIcon,
  start_exam: PlayArrowIcon,
  view_result: VisibilityIcon,
  grader_notes: RecordVoiceOverIcon,
  awaiting_result: HourglassEmptyIcon,
};

const severityColor = {
  error: "error",
  warning: "warning",
  info: "info",
  success: "success",
} as const;

interface DashboardActionCardProps {
  action: DashboardAction;
  featured?: boolean;
}

export default function DashboardActionCard({ action, featured }: DashboardActionCardProps) {
  const router = useRouter();
  const Icon = kindIcon[action.kind];
  const color = severityColor[action.severity];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: featured ? `${color}.light` : "divider",
        bgcolor: featured ? (theme) => alpha(theme.palette[color].main, 0.06) : "background.paper",
        overflow: "hidden",
      }}
    >
      <CardActionArea onClick={() => router.push(action.href)}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ p: featured ? { xs: 1.5, md: 2 } : { xs: 1.25, md: 1.5 } }}
        >
          <Box
            sx={{
              width: featured ? 48 : 40,
              height: featured ? 48 : 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
              color: `${color}.main`,
              flexShrink: 0,
            }}
          >
            <Icon fontSize={featured ? "medium" : "small"} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant={featured ? "subtitle1" : "body2"} fontWeight={700} noWrap>
              {action.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }} noWrap>
              {action.subtitle}
            </Typography>
          </Box>
          <Chip
            label={action.ctaLabel}
            size="small"
            color={color}
            variant={featured ? "filled" : "outlined"}
            sx={{ flexShrink: 0, fontWeight: 600 }}
          />
        </Stack>
      </CardActionArea>
    </Card>
  );
}
