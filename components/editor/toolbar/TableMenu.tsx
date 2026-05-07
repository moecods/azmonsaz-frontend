"use client";

import { useState } from 'react';
import { Box, Menu, MenuItem, Typography, Divider } from '@mui/material';
import type { Editor } from '@tiptap/core';

import TableChartIcon from '@mui/icons-material/TableChart';
import { ToolbarButton } from './ToolbarButton';

const PRESETS = [
  { rows: 2, cols: 2 },
  { rows: 3, cols: 3 },
  { rows: 4, cols: 4 },
  { rows: 3, cols: 5 },
];

export interface TableMenuProps {
  editor: Editor;
}

export function TableMenu({ editor }: TableMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);
  const inTable = editor.isActive('table');

  const insert = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    close();
  };

  return (
    <>
      <ToolbarButton
        label="جدول"
        active={inTable}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <TableChartIcon fontSize="small" />
      </ToolbarButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">درج جدول</Typography>
        </Box>
        {PRESETS.map(({ rows, cols }) => (
          <MenuItem key={`${rows}x${cols}`} onClick={() => insert(rows, cols)}>
            {rows} × {cols}
          </MenuItem>
        ))}
        {inTable && [
          <Divider key="div" />,
          <Box key="header" sx={{ px: 2, pt: 0.5, pb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">عملیات</Typography>
          </Box>,
          <MenuItem key="row-before" onClick={() => { editor.chain().focus().addRowBefore().run(); close(); }}>افزودن سطر بالا</MenuItem>,
          <MenuItem key="row-after" onClick={() => { editor.chain().focus().addRowAfter().run(); close(); }}>افزودن سطر پایین</MenuItem>,
          <MenuItem key="row-del" onClick={() => { editor.chain().focus().deleteRow().run(); close(); }}>حذف سطر</MenuItem>,
          <Divider key="div2" />,
          <MenuItem key="col-before" onClick={() => { editor.chain().focus().addColumnBefore().run(); close(); }}>افزودن ستون قبل</MenuItem>,
          <MenuItem key="col-after" onClick={() => { editor.chain().focus().addColumnAfter().run(); close(); }}>افزودن ستون بعد</MenuItem>,
          <MenuItem key="col-del" onClick={() => { editor.chain().focus().deleteColumn().run(); close(); }}>حذف ستون</MenuItem>,
          <Divider key="div3" />,
          <MenuItem key="header-row" onClick={() => { editor.chain().focus().toggleHeaderRow().run(); close(); }}>تبدیل به سطر هدر</MenuItem>,
          <MenuItem key="merge" onClick={() => { editor.chain().focus().mergeOrSplit().run(); close(); }}>ادغام/جدا کردن سلول</MenuItem>,
          <MenuItem
            key="del"
            onClick={() => { editor.chain().focus().deleteTable().run(); close(); }}
            sx={{ color: 'error.main' }}
          >
            حذف جدول
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
}
