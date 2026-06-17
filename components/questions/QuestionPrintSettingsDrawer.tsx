"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QuestionPrintSettingsPanel from "./QuestionPrintSettingsPanel";
import {
  mergeQuestionPrintSettings,
  type QuestionPrintSettings,
} from "@/lib/question-types/print-settings";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";

export interface QuestionPrintSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  questionType: string;
  initialSettings?: QuestionPrintSettings | Record<string, unknown> | null;
  variant?: PrintQuestionVariant;
  blankCount?: number;
  saving?: boolean;
  onSave: (settings: QuestionPrintSettings) => void | Promise<void>;
  onDraftChange?: (settings: QuestionPrintSettings) => void;
}

export default function QuestionPrintSettingsDrawer({
  open,
  onClose,
  title = "تنظیمات چاپ سوال",
  questionType,
  initialSettings,
  variant = "default",
  blankCount,
  saving = false,
  onSave,
  onDraftChange,
}: QuestionPrintSettingsDrawerProps) {
  const [draft, setDraft] = useState<QuestionPrintSettings>({});

  useEffect(() => {
    if (open) {
      const merged = mergeQuestionPrintSettings(initialSettings);
      setDraft(merged);
      onDraftChange?.(merged);
    }
  }, [open, initialSettings, onDraftChange]);

  const handleDraftChange = (next: QuestionPrintSettings) => {
    setDraft(next);
    onDraftChange?.(next);
  };

  const handleSave = async () => {
    await onSave(draft);
    onClose();
  };

  if (!open) return null;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ sx: { zIndex: 1600 } }}
      PaperProps={{ sx: { width: { xs: "100%", sm: 400 } } }}
    >
      <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="بستن">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <QuestionPrintSettingsPanel
            questionType={questionType}
            value={draft}
            onChange={handleDraftChange}
            variant={variant}
            blankCount={blankCount}
            showAdvanced
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Button variant="outlined" onClick={onClose} disabled={saving} fullWidth>
            انصراف
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            fullWidth
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
