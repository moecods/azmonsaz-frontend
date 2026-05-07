"use client";

import { IconButton, Tooltip } from '@mui/material';
import type { IconButtonProps } from '@mui/material';
import { forwardRef, type ReactNode } from 'react';

export interface ToolbarButtonProps extends Omit<IconButtonProps, 'title'> {
  label: string;
  active?: boolean;
  shortcut?: string;
  children: ReactNode;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ label, active, shortcut, children, sx, ...rest }, ref) {
    const tip = shortcut ? `${label} (${shortcut})` : label;
    return (
      <Tooltip title={tip} arrow placement="bottom">
        <span>
          <IconButton
            ref={ref}
            size="small"
            aria-label={label}
            aria-pressed={active ? 'true' : undefined}
            sx={[
              {
                width: 32,
                height: 32,
                borderRadius: 1,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: active ? 'primary.dark' : 'text.primary',
                },
              },
              ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
            {...rest}
          >
            {children}
          </IconButton>
        </span>
      </Tooltip>
    );
  },
);
