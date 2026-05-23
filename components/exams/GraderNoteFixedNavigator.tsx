"use client";

import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Slide,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { GraderNoteEngagementStats, GraderNoteScrollTarget } from '@/lib/grader-notes';
import {
  DESKTOP_SHELL_PADDING_X,
  MOBILE_BOTTOM_NAV_HEIGHT,
  MOBILE_SHELL_PADDING_X,
  SIDEBAR_WIDTH,
} from '@/components/layout/layout-constants';

interface GraderNoteFixedNavigatorProps {
  visible: boolean;
  stats: GraderNoteEngagementStats;
  nextTarget: GraderNoteScrollTarget | null;
  onJump: () => void;
}

function statusChip(target: GraderNoteScrollTarget) {
  if (target.status === 'unseen') {
    return <Chip label="جدید" size="small" color="info" />;
  }
  if (target.status === 'needs_ack') {
    return <Chip label="نیاز به تأیید" size="small" color="warning" />;
  }
  return null;
}

function remainingHint(stats: GraderNoteEngagementStats): string {
  if (stats.outstandingCount <= 0) {
    return 'همه یادداشت‌ها بررسی شد.';
  }
  const suffix =
    stats.unseenCount > 0 && stats.pendingAckCount > 0
      ? ' (مشاهده و تأیید)'
      : stats.pendingAckCount > 0
        ? ' (نیاز به تأیید)'
        : ' (مشاهده نشده)';
  return `${stats.outstandingCount.toLocaleString('fa-IR')} یادداشت باقی‌مانده${suffix}`;
}

export default function GraderNoteFixedNavigator({
  visible,
  stats,
  nextTarget,
  onJump,
}: GraderNoteFixedNavigatorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (stats.total === 0) {
    return null;
  }

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const jumpLabel =
    nextTarget?.status === 'needs_ack'
      ? 'رفتن به یادداشت — تأیید کنید'
      : 'رفتن به یادداشت بعدی';

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        role="region"
        aria-label="پیمایش یادداشت‌های معلم"
        sx={{
          position: 'fixed',
          bottom: isMobile ? MOBILE_BOTTOM_NAV_HEIGHT + 16 : 20,
          zIndex: theme.zIndex.drawer + 2,
          // Mobile: full width inside main. Desktop: exclude sidebar column (inline-start in RTL).
          insetInlineStart: isMobile
            ? MOBILE_SHELL_PADDING_X
            : SIDEBAR_WIDTH + DESKTOP_SHELL_PADDING_X,
          insetInlineEnd: isMobile ? MOBILE_SHELL_PADDING_X : DESKTOP_SHELL_PADDING_X,
          width: isMobile
            ? 'auto'
            : `min(920px, calc(100vw - ${SIDEBAR_WIDTH}px - ${DESKTOP_SHELL_PADDING_X * 2}px))`,
          maxWidth: 920,
          mx: 'auto',
          borderRadius: { xs: 3, md: 2 },
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'warning.light',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(237, 108, 2, 0.22)',
        }}
      >
        <LinearProgress variant="determinate" value={progress} color="warning" sx={{ height: 3 }} />

        {isMobile ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                  <RecordVoiceOverIcon color="warning" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    یادداشت‌های معلم
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {stats.completed.toLocaleString('fa-IR')} از {stats.total.toLocaleString('fa-IR')} بررسی‌شده
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {remainingHint(stats)}
              </Typography>

              {nextTarget && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ px: 1, py: 0.75, borderRadius: 1, bgcolor: 'warning.50' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    بعدی:
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {nextTarget.label}
                  </Typography>
                  {statusChip(nextTarget)}
                </Stack>
              )}

              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={onJump}
                disabled={!nextTarget}
                sx={{ fontWeight: 700, py: 1.1, boxShadow: 'none', '&:hover': { boxShadow: 2 } }}
              >
                {jumpLabel}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ px: 2.5, py: 1.25, minHeight: 56 }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0 }}>
              <RecordVoiceOverIcon color="warning" fontSize="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.3}>
                  یادداشت‌های معلم
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {stats.completed.toLocaleString('fa-IR')} از {stats.total.toLocaleString('fa-IR')} بررسی‌شده
                  {' · '}
                  {remainingHint(stats)}
                </Typography>
              </Box>
            </Stack>

            {nextTarget ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="nowrap"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'warning.50',
                  overflow: 'hidden',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  بعدی:
                </Typography>
                <Typography variant="caption" fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                  {nextTarget.label}
                </Typography>
                {statusChip(nextTarget)}
              </Stack>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}

            <Button
              variant="contained"
              color="warning"
              size="medium"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={onJump}
              disabled={!nextTarget}
              sx={{
                flexShrink: 0,
                fontWeight: 700,
                px: 2.5,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                '&:hover': { boxShadow: 2 },
              }}
            >
              {jumpLabel}
            </Button>
          </Stack>
        )}
      </Paper>
    </Slide>
  );
}
