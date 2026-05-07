"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Editor } from '@tiptap/core';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import FunctionsIcon from '@mui/icons-material/Functions';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import TitleIcon from '@mui/icons-material/Title';
import FormatTextdirectionRToLIcon from '@mui/icons-material/FormatTextdirectionRToL';
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR';

import { ToolbarButton } from './ToolbarButton';
import { ColorButton } from './ColorButton';
import { LinkDialog } from './LinkDialog';
import { ImageDialog } from './ImageDialog';
import { TableMenu } from './TableMenu';
import { LayoutMenu } from './LayoutMenu';
import { MathDialog } from './MathDialog';
import { OverflowMenu, type OverflowMenuItem } from './OverflowMenu';
import {
  findMathAtSelection,
  MATH_BLOCK_NAME,
  MATH_EDIT_EVENT,
  MATH_INLINE_NAME,
} from '../extensions/Math';

export interface EditorToolbarProps {
  editor: Editor;
  preset?: 'full' | 'minimal';
}

interface DialogState {
  link: boolean;
  image: boolean;
  math: boolean;
}

interface MathInitial {
  latex: string;
  displayMode: boolean;
  isEditing: boolean;
}

const EMPTY_MATH: MathInitial = {
  latex: '',
  displayMode: false,
  isEditing: false,
};

export function EditorToolbar({ editor, preset = 'full' }: EditorToolbarProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [dialog, setDialog] = useState<DialogState>({
    link: false,
    image: false,
    math: false,
  });
  const [headingAnchor, setHeadingAnchor] = useState<HTMLElement | null>(null);
  const [mathInitial, setMathInitial] = useState<MathInitial>(EMPTY_MATH);

  const isFull = preset === 'full';

  const parentDir = (editor.state.selection.$from.parent.attrs?.dir as
    | 'rtl'
    | 'ltr'
    | 'auto'
    | undefined) ?? 'rtl';

  const can = editor.can();
  const is = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);
  const isAlign = (alignment: 'left' | 'center' | 'right' | 'justify') =>
    editor.isActive({ textAlign: alignment });

  const setColor = (color: string | null) => {
    if (color) editor.chain().focus().setColor(color).run();
    else editor.chain().focus().unsetColor().run();
  };
  const setBg = (color: string | null) => {
    if (color) editor.chain().focus().setBackgroundColor(color).run();
    else editor.chain().focus().unsetBackgroundColor().run();
  };

  const openLinkDialog = () => {
    setDialog((d) => ({ ...d, link: true }));
  };

  const openMathDialog = useCallback(() => {
    const found = findMathAtSelection(editor.state);
    const node = found ? editor.state.doc.nodeAt(found.pos) : null;
    const inMath =
      node?.type.name === MATH_INLINE_NAME || node?.type.name === MATH_BLOCK_NAME;
    setMathInitial({
      latex: inMath ? String(node?.attrs.latex ?? '') : '',
      displayMode: inMath ? node?.type.name === MATH_BLOCK_NAME : false,
      isEditing: Boolean(inMath),
    });
    setDialog((d) => ({ ...d, math: true }));
  }, [editor]);

  // Open the math dialog when the user clicks an existing formula in the editor.
  useEffect(() => {
    const root = editor.view.dom;
    const handler = () => openMathDialog();
    root.addEventListener(MATH_EDIT_EVENT, handler);
    return () => root.removeEventListener(MATH_EDIT_EVENT, handler);
  }, [editor, openMathDialog]);

  const handleMathSubmit = ({ latex, displayMode }: { latex: string; displayMode: boolean }) => {
    if (mathInitial.isEditing) {
      editor.chain().focus().updateMath(latex).run();
    } else if (displayMode) {
      editor.chain().focus().insertMathBlock(latex).run();
    } else {
      editor.chain().focus().insertMathInline(latex).run();
    }
    setDialog((d) => ({ ...d, math: false }));
  };

  const handleMathRemove = () => {
    if (mathInitial.isEditing) {
      editor.chain().focus().deleteMath().run();
    }
    setDialog((d) => ({ ...d, math: false }));
  };

  const linkAttrs = editor.getAttributes('link') as { href?: string };
  const selectionEmpty = editor.state.selection.empty;

  // Less-frequently used actions live behind a "more" menu (full preset only).
  const overflowItems: OverflowMenuItem[] = isFull
    ? [
        {
          id: 'link',
          label: linkAttrs.href ? 'ویرایش لینک' : 'افزودن لینک',
          shortcut: 'Ctrl+K',
          icon: <LinkIcon fontSize="small" />,
          active: is('link'),
          onClick: openLinkDialog,
        },
        ...(is('link')
          ? [
              {
                id: 'unlink',
                label: 'حذف لینک',
                icon: <LinkOffIcon fontSize="small" />,
                onClick: () => editor.chain().focus().unsetLink().run(),
              },
            ]
          : []),
        {
          id: 'inline-code',
          label: 'کد درون‌خطی',
          icon: <CodeIcon fontSize="small" />,
          active: is('code'),
          onClick: () => editor.chain().focus().toggleCode().run(),
        },
        {
          id: 'code-block',
          label: 'بلوک کد',
          icon: <DataObjectIcon fontSize="small" />,
          active: is('codeBlock'),
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          id: 'blockquote',
          label: 'نقل قول',
          icon: <FormatQuoteIcon fontSize="small" />,
          active: is('blockquote'),
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          id: 'hr',
          label: 'خط افقی',
          icon: <HorizontalRuleIcon fontSize="small" />,
          onClick: () => editor.chain().focus().setHorizontalRule().run(),
        },
      ]
    : [];

  return (
    <Box
      role="toolbar"
      aria-label="نوار ابزار ویرایشگر"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: '14px  14px 0px 0px',
        px: 0.75,
        py: 0.5,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        sx={{
          gap: 0.25,
          rowGap: 0.5,
          '& > .toolbar-divider': {
            mx: 0.5,
            height: 22,
            alignSelf: 'center',
          },
        }}
      >
        {/* History */}
        <ToolbarButton
          label="بازگردانی"
          shortcut="Ctrl+Z"
          disabled={!can.undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <UndoIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          label="انجام مجدد"
          shortcut="Ctrl+Shift+Z"
          disabled={!can.redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <RedoIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem className="toolbar-divider" />

        {/* Headings (full only) */}
        {isFull && (
          <>
            <ToolbarButton
              label="عنوان"
              active={is('heading')}
              onClick={(e) => setHeadingAnchor(e.currentTarget)}
            >
              <TitleIcon fontSize="small" />
            </ToolbarButton>
            <Menu
              open={Boolean(headingAnchor)}
              anchorEl={headingAnchor}
              onClose={() => setHeadingAnchor(null)}
            >
              <MenuItem
                selected={is('paragraph')}
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setHeadingAnchor(null);
                }}
              >
                <Typography variant="body1">متن معمولی</Typography>
              </MenuItem>
              {[1, 2, 3].map((level) => (
                <MenuItem
                  key={level}
                  selected={is('heading', { level })}
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .toggleHeading({ level: level as 1 | 2 | 3 })
                      .run();
                    setHeadingAnchor(null);
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: level === 1 ? 22 : level === 2 ? 18 : 16,
                    }}
                  >
                    عنوان {level}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <Divider orientation="vertical" flexItem className="toolbar-divider" />
          </>
        )}

        {/* Inline marks */}
        <ToolbarButton
          label="ضخیم"
          shortcut="Ctrl+B"
          active={is('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          label="کج"
          shortcut="Ctrl+I"
          active={is('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          label="زیرخط"
          shortcut="Ctrl+U"
          active={is('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </ToolbarButton>
        {isFull && (
          <ToolbarButton
            label="خط زده"
            active={is('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughSIcon fontSize="small" />
          </ToolbarButton>
        )}

        {/* Sub/Sup — useful in option text for chemistry / math */}
        <ToolbarButton
          label="بالانویس"
          active={is('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          label="زیرنویس"
          active={is('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon fontSize="small" />
        </ToolbarButton>

        {/* Colors (full only) */}
        {isFull && (
          <>
            <Divider orientation="vertical" flexItem className="toolbar-divider" />
            <ColorButton
              label="رنگ متن"
              variant="text"
              icon={<FormatColorTextIcon fontSize="small" />}
              currentColor={
                (editor.getAttributes('textStyle') as { color?: string }).color ?? null
              }
              onSelect={setColor}
            />
            <ColorButton
              label="هایلایت"
              variant="highlight"
              icon={<FormatColorFillIcon fontSize="small" />}
              currentColor={
                (editor.getAttributes('textStyle') as { backgroundColor?: string })
                  .backgroundColor ?? null
              }
              onSelect={setBg}
            />
          </>
        )}

        {/* Lists (full only — keeps the option toolbar tight) */}
        {isFull && (
          <>
            <Divider orientation="vertical" flexItem className="toolbar-divider" />
            <ToolbarButton
              label="فهرست بدون شماره"
              active={is('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton
              label="فهرست شماره‌دار"
              active={is('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <FormatListNumberedIcon fontSize="small" />
            </ToolbarButton>
          </>
        )}

        {/* Alignment (full only) */}
        {isFull && (
          <>
            <Divider orientation="vertical" flexItem className="toolbar-divider" />
            <ToolbarButton
              label="چپ‌چین"
              active={isAlign('left')}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <FormatAlignLeftIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton
              label="وسط‌چین"
              active={isAlign('center')}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <FormatAlignCenterIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton
              label="راست‌چین"
              active={isAlign('right')}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <FormatAlignRightIcon fontSize="small" />
            </ToolbarButton>
            {!compact && (
              <ToolbarButton
                label="هم‌تراز"
                active={isAlign('justify')}
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              >
                <FormatAlignJustifyIcon fontSize="small" />
              </ToolbarButton>
            )}
          </>
        )}

        <Divider orientation="vertical" flexItem className="toolbar-divider" />

        {/* Direction (always shown — content can be Persian or English) */}
        <ToolbarButton
          label="جهت راست به چپ"
          active={parentDir === 'rtl'}
          onClick={() => editor.chain().focus().setTextDirection('rtl').run()}
        >
          <FormatTextdirectionRToLIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          label="جهت چپ به راست"
          active={parentDir === 'ltr'}
          onClick={() => editor.chain().focus().setTextDirection('ltr').run()}
        >
          <FormatTextdirectionLToRIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem className="toolbar-divider" />

        {/* Math + Image — both very common in question content and options */}
        <ToolbarButton
          label="فرمول ریاضی"
          active={is(MATH_INLINE_NAME) || is(MATH_BLOCK_NAME)}
          onClick={openMathDialog}
        >
          <FunctionsIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton
          label="تصویر"
          onClick={() => setDialog((d) => ({ ...d, image: true }))}
        >
          <ImageIcon fontSize="small" />
        </ToolbarButton>

        {/* Tables + multi-column layouts (full only) */}
        {isFull && (
          <>
            <Divider orientation="vertical" flexItem className="toolbar-divider" />
            <TableMenu editor={editor} />
            <LayoutMenu editor={editor} />
          </>
        )}

        {/* Less-used actions: code / link / blockquote / hr (full only) */}
        {isFull && overflowItems.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem className="toolbar-divider" />
            <OverflowMenu items={overflowItems} />
          </>
        )}
      </Stack>

      <LinkDialog
        open={dialog.link}
        initialUrl={linkAttrs.href ?? ''}
        selectionEmpty={selectionEmpty && !is('link')}
        onClose={() => setDialog((d) => ({ ...d, link: false }))}
        onRemove={() => {
          editor.chain().focus().unsetLink().run();
          setDialog((d) => ({ ...d, link: false }));
        }}
        onSubmit={({ url, text }) => {
          const chain = editor.chain().focus();
          if (selectionEmpty && !is('link') && text) {
            chain
              .insertContent({
                type: 'text',
                text,
                marks: [{ type: 'link', attrs: { href: url } }],
              })
              .run();
          } else {
            chain.extendMarkRange('link').setLink({ href: url }).run();
          }
          setDialog((d) => ({ ...d, link: false }));
        }}
      />

      <ImageDialog
        open={dialog.image}
        onClose={() => setDialog((d) => ({ ...d, image: false }))}
        onSubmit={({ src, alt }) => {
          editor.chain().focus().setImage({ src, alt }).run();
          setDialog((d) => ({ ...d, image: false }));
        }}
      />

      <MathDialog
        open={dialog.math}
        initialLatex={mathInitial.latex}
        initialDisplayMode={mathInitial.displayMode}
        isEditing={mathInitial.isEditing}
        onClose={() => setDialog((d) => ({ ...d, math: false }))}
        onSubmit={handleMathSubmit}
        onRemove={mathInitial.isEditing ? handleMathRemove : undefined}
      />
    </Box>
  );
}
