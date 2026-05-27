import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  paletteTokens,
  typographyTokens,
  spacingUnit,
  radius,
  breakpoints,
} from '@/theme/tokens';
import { brandPanelSx } from '@/theme/page-sx';

const meta: Meta = {
  title: 'سیستم طراحی/توکن‌ها',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'منبع حقیقت بصری — `theme/tokens.ts` (کد) و `theme/design-tokens.json` (Figma / Tokens Studio). جزئیات: `docs/DESIGN.md`.',
      },
    },
  },
  tags: ['autodocs', 'visual'],
};

export default meta;

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Box
        sx={{
          height: 48,
          borderRadius: 1,
          bgcolor: hex,
          border: 1,
          borderColor: 'divider',
          mb: 1,
        }}
      />
      <Typography variant="caption" fontWeight={700} display="block">
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
        {hex}
      </Typography>
    </Paper>
  );
}

function DesignTokensPage() {
  const theme = useTheme();
  const semantic = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

  return (
    <Stack spacing={4} sx={{ maxWidth: 960 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Design Tokens
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          این صفحه مقادیر ثابت در `theme/tokens.ts` را نشان می‌دهد. تم MUI از{' '}
          `createAppTheme.ts` ساخته می‌شود.
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          رنگ‌های معنایی
        </Typography>
        <Grid container spacing={1.5}>
          {semantic.map((key) => (
            <Grid key={key} size={{ xs: 6, sm: 4, md: 2 }}>
              <Swatch name={key} hex={paletteTokens[key].main} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          پس‌زمینه و متن (حالت فعلی تم)
        </Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Swatch name="background.default" hex={theme.palette.background.default} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Swatch name="background.paper" hex={theme.palette.background.paper} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Swatch name="text.primary" hex={theme.palette.text.primary} />
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          ...brandPanelSx(theme),
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          brandPanelSx
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          گرادیان برند — فقط از `theme/page-sx.ts` (لندینگ، auth، CTA)
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          تایپوگرافی (فارسی)
        </Typography>
        <Stack spacing={1.5}>
          <Typography variant="h4" sx={{ fontFamily: typographyTokens.fontFamily.fa }}>
            Vazirmatn — عنوان H4
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: typographyTokens.fontFamily.fa }}>
            body1 — متن اصلی فارسی با line-height {typographyTokens.body1.lineHeight}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontFamily.fa: {typographyTokens.fontFamily.fa}
          </Typography>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          فاصله (spacing unit = {spacingUnit}px)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {[1, 2, 3, 4, 6, 8].map((n) => (
            <Chip
              key={n}
              label={`spacing(${n}) = ${n * spacingUnit}px`}
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          شعاع (radius)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {Object.entries(radius).map(([key, value]) =>
            typeof value === 'number' ? (
              <Box
                key={key}
                sx={{
                  width: 72,
                  height: 48,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  borderRadius: `${value}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption">{key}</Typography>
              </Box>
            ) : null
          )}
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Breakpoints (px)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {Object.entries(breakpoints).map(([key, value]) => (
            <Chip key={key} label={`${key}: ${value}`} size="small" />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export const Overview: StoryObj = {
  tags: ['visual'],
  render: () => <DesignTokensPage />,
};
