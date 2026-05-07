"use client";

import { useState, type ReactNode } from 'react';
import { Box, Popover, Stack, Typography, ButtonBase } from '@mui/material';
import { ToolbarButton } from './ToolbarButton';

const TEXT_PALETTE = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#22C55E', '#10B981', '#06B6D4', '#3B82F6',
  '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
];

const HIGHLIGHT_PALETTE = [
  'transparent',
  '#FEF3C7', '#FDE68A', '#FCD34D',
  '#FECACA', '#FCA5A5', '#F87171',
  '#BFDBFE', '#93C5FD', '#60A5FA',
  '#BBF7D0', '#86EFAC', '#4ADE80',
  '#E9D5FF', '#C4B5FD', '#A78BFA',
];

export interface ColorButtonProps {
  label: string;
  icon: ReactNode;
  variant: 'text' | 'highlight';
  active?: boolean;
  currentColor?: string | null;
  onSelect: (color: string | null) => void;
}

export function ColorButton({
  label,
  icon,
  variant,
  active,
  currentColor,
  onSelect,
}: ColorButtonProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const palette = variant === 'text' ? TEXT_PALETTE : HIGHLIGHT_PALETTE;
  const open = Boolean(anchor);

  return (
    <>
      <ToolbarButton
        label={label}
        active={active}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          position: 'relative',
          '&::after': currentColor && currentColor !== 'transparent'
            ? {
                content: '""',
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 3,
                borderRadius: 1,
                bgcolor: currentColor,
                border: '1px solid',
                borderColor: 'divider',
              }
            : undefined,
        }}
      >
        {icon}
      </ToolbarButton>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, width: 220 } } }}
      >
        <Stack spacing={1.5}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 0.5,
            }}
          >
            {palette.map((color) => (
              <ButtonBase
                key={color}
                onClick={() => {
                  onSelect(color === 'transparent' ? null : color);
                  setAnchor(null);
                }}
                aria-label={color}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 0.75,
                  bgcolor: color,
                  border: color === 'transparent' ? '1px dashed' : '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  '&::after': color === 'transparent'
                    ? {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(45deg, transparent 45%, #DC2626 45%, #DC2626 55%, transparent 55%)',
                      }
                    : undefined,
                  '&:hover': {
                    transform: 'scale(1.12)',
                    boxShadow: 1,
                  },
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </Box>
          <ButtonBase
            onClick={() => {
              onSelect(null);
              setAnchor(null);
            }}
            sx={{
              mt: 0.5,
              py: 0.75,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: 13,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            حذف رنگ
          </ButtonBase>
        </Stack>
      </Popover>
    </>
  );
}
