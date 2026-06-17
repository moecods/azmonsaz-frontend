"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ExamTemplateId } from "@/lib/exam-print/types";
import TemplatePicker from "./TemplatePicker";

interface TemplatePickerDialogProps {
  open: boolean;
  onClose: () => void;
  selected: ExamTemplateId;
  onSelect: (id: ExamTemplateId) => void;
}

export default function TemplatePickerDialog({
  open,
  onClose,
  selected,
  onSelect,
}: TemplatePickerDialogProps) {
  const handleSelect = (id: ExamTemplateId) => {
    onSelect(id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="template-picker-dialog-title"
    >
      <DialogTitle
        id="template-picker-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          py: 1.5,
        }}
      >
        <Typography component="span" variant="subtitle1" fontWeight={700}>
          انتخاب قالب برگه
        </Typography>
        <IconButton onClick={onClose} aria-label="بستن" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <TemplatePicker selected={selected} onSelect={handleSelect} hideTitle />
      </DialogContent>
    </Dialog>
  );
}
