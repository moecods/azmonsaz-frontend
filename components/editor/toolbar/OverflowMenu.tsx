"use client";

import { useState, type ReactNode } from 'react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { ToolbarButton } from './ToolbarButton';

export interface OverflowMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface OverflowMenuProps {
  label?: string;
  items: OverflowMenuItem[];
}

/**
 * A "three-dot" overflow toolbar button that hosts less-frequently used
 * actions (e.g. inline code, code block, blockquote, link) so the main row
 * stays uncluttered.
 */
export function OverflowMenu({
  label = 'سایر امکانات',
  items,
}: OverflowMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  if (items.length === 0) return null;

  return (
    <>
      <ToolbarButton
        label={label}
        active={items.some((i) => i.active)}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreHorizIcon fontSize="small" />
      </ToolbarButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            disabled={item.disabled}
            selected={item.active}
            onClick={() => {
              item.onClick();
              setAnchor(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.shortcut}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
