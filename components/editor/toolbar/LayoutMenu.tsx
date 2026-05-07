"use client";

import { useState } from 'react';
import { Menu, MenuItem, Stack, Box } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import type { Editor } from '@tiptap/core';

import { ToolbarButton } from './ToolbarButton';

export interface LayoutMenuProps {
  editor: Editor;
}

const PRESETS: { cols: 2 | 3 | 4; label: string; weights: number[][] }[] = [
  { cols: 2, label: 'دو ستون', weights: [[1, 1], [1, 2], [2, 1]] },
  { cols: 3, label: 'سه ستون', weights: [[1, 1, 1]] },
  { cols: 4, label: 'چهار ستون', weights: [[1, 1, 1, 1]] },
];

export function LayoutMenu({ editor }: LayoutMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const insert = (cols: 2 | 3 | 4, weights?: number[]) => {
    editor.chain().focus().insertLayout(cols).run();
    if (!weights || weights.every((w) => w === weights[0])) {
      setAnchor(null);
      return;
    }
    /*
     * After inserting, the selection lives inside the first column. Walk up to
     * the layout node we just produced and apply custom column widths.
     */
    const { state, view } = editor;
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'layout') {
        const layoutPos = $from.before(d);
        const layoutNode = $from.node(d);
        const tr = state.tr;
        let pos = layoutPos + 1;
        layoutNode.forEach((child, _o, i) => {
          tr.setNodeMarkup(pos, undefined, {
            ...child.attrs,
            width: weights[i] ?? 1,
          });
          pos += child.nodeSize;
        });
        view.dispatch(tr);
        break;
      }
    }
    setAnchor(null);
  };

  return (
    <>
      <ToolbarButton
        label="درج چیدمان ستونی"
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
      >
        <ViewColumnIcon fontSize="small" />
      </ToolbarButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {PRESETS.flatMap(({ cols, label, weights }) =>
          weights.map((w) => (
            <MenuItem
              key={`${cols}-${w.join('-')}`}
              onClick={() => insert(cols, w)}
              sx={{ gap: 1, minWidth: 220 }}
            >
              <Stack direction="row" gap={0.5} sx={{ flex: '0 0 80px' }}>
                {w.map((wi, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: `${wi} 1 0`,
                      height: 16,
                      borderRadius: 0.5,
                      bgcolor: 'primary.main',
                      opacity: 0.85,
                    }}
                  />
                ))}
              </Stack>
              <Box sx={{ flex: 1, fontSize: 14 }}>
                {label}
                {w.length > 1 && w.some((wi) => wi !== w[0])
                  ? ` (${w.join(':')})`
                  : ''}
              </Box>
            </MenuItem>
          )),
        )}
      </Menu>
    </>
  );
}
