"use client";

import { Box, Button, Chip, Typography } from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import { getTemplateConfig } from "@/lib/exam-print/template-registry";
import type { ExamTemplateId } from "@/lib/exam-print/types";
import { TemplateThumbnail } from "./TemplatePicker";

interface SelectedTemplatePreviewProps {
  template: ExamTemplateId;
  onChangeClick: () => void;
}

/** Vertical template preview — thumbnail (A4 ratio) with change button below. */
export default function SelectedTemplatePreview({
  template,
  onChangeClick,
}: SelectedTemplatePreviewProps) {
  const config = getTemplateConfig(template);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        قالب برگه
      </Typography>
      <Box
        sx={{
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <TemplateThumbnail templateId={template} />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" fontWeight={700}>
          {config.label}
        </Typography>
        <Chip
          label={config.levelLabel}
          size="small"
          sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
        />
      </Box>
      <Button
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<PaletteIcon sx={{ fontSize: 16 }} />}
        onClick={onChangeClick}
      >
        تغییر قالب
      </Button>
    </Box>
  );
}
