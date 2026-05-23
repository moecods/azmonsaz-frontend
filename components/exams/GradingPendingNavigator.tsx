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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RateReviewIcon from '@mui/icons-material/RateReview';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { GradingScrollTarget, PendingGradingStats } from '@/lib/grading-navigation';
import {
  DESKTOP_SHELL_PADDING_X,
  MOBILE_BOTTOM_NAV_HEIGHT,
  MOBILE_SHELL_PADDING_X,
  SIDEBAR_WIDTH,
} from '@/components/layout/layout-constants';

interface GradingPendingNavigatorProps {
  visible: boolean;
  stats: PendingGradingStats;
  nextTarget: GradingScrollTarget | null;
  onJump: () => void;
  onDismiss: () => void;
}

function remainingHint(stats: PendingGradingStats): string {
  if (stats.outstandingCount <= 0) {
    return 'همه سوالات نیازمند تصحیح، نمره‌دهی شده‌اند.';
  }
  return `${stats.outstandingCount.toLocaleString('fa-IR')} سوال در انتظار نمره‌دهی`;
}

export default function GradingPendingNavigator({
  visible,
  stats,
  nextTarget,
  onJump,
  onDismiss,
}: GradingPendingNavigatorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (stats.total === 0) {
    return null;
  }

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        role="region"
        aria-label="پیمایش سوالات در انتظار تصحیح"
        sx={{
          position: 'fixed',
          bottom: isMobile ? MOBILE_BOTTOM_NAV_HEIGHT + 16 : 20,
          zIndex: theme.zIndex.drawer + 2,
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
          borderColor: 'info.light',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(2, 136, 209, 0.18)',
        }}
      >
        <LinearProgress variant="determinate" value={progress} color="info" sx={{ height: 3 }} />

        {isMobile ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Stack direction="row" spacing={1} alignItems="center" minWidth={0} sx={{ flex: 1 }}>
                  <RateReviewIcon color="info" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    تصحیح سوالات
                  </Typography>
                </Stack>
                <IconButton size="small" aria-label="بستن" onClick={onDismiss} sx={{ mt: -0.5 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {stats.completed.toLocaleString('fa-IR')} از {stats.total.toLocaleString('fa-IR')} تصحیح‌شده
                {' · '}
                {remainingHint(stats)}
              </Typography>

              {nextTarget && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ px: 1, py: 0.75, borderRadius: 1, bgcolor: 'info.50' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    بعدی:
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {nextTarget.label}
                  </Typography>
                </Stack>
              )}

              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={onJump}
                disabled={!nextTarget}
                sx={{ fontWeight: 700, py: 1.1, boxShadow: 'none', '&:hover': { boxShadow: 2 } }}
              >
                رفتن به سوال بعدی
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
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0, minWidth: 0 }}>
              <RateReviewIcon color="info" fontSize="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.3}>
                  تصحیح سوالات
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {stats.completed.toLocaleString('fa-IR')} از {stats.total.toLocaleString('fa-IR')} تصحیح‌شده
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
                sx={{
                  flex: 1,
                  minWidth: 0,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'info.50',
                  overflow: 'hidden',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  بعدی:
                </Typography>
                <Typography variant="caption" fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                  {nextTarget.label}
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
              <Button
                variant="contained"
                color="info"
                size="medium"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={onJump}
                disabled={!nextTarget}
                sx={{
                  fontWeight: 700,
                  px: 2.5,
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 2 },
                }}
              >
                رفتن به سوال بعدی
              </Button>
              <IconButton size="small" aria-label="بستن" onClick={onDismiss}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Slide>
  );
}
