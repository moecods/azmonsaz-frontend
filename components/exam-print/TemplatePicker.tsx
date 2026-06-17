"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Box, Card, CardActionArea, Chip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { EXAM_TEMPLATES } from "@/lib/exam-print/template-registry";
import { SAMPLE_PRINT_EXAM } from "@/lib/exam-print/sample-exam";
import type { ExamTemplateId } from "@/lib/exam-print/types";
import { renderExamTemplate } from "./render-template";

/** A4 portrait ratio (210 × 297 mm). */
export const A4_ASPECT_RATIO = "210 / 297";

/** Approximate CSS pixels for 210mm at 96dpi — used to scale thumbnail content. */
const A4_WIDTH_PX = (210 * 96) / 25.4;

interface TemplatePickerProps {
  selected: ExamTemplateId;
  onSelect: (id: ExamTemplateId) => void;
  hideTitle?: boolean;
}

const LEVEL_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "info" | "warning"> = {
  preschool: "warning",
  primary: "success",
  middle: "info",
  high: "primary",
  university: "secondary",
  general: "default",
};

interface TemplateThumbnailProps {
  templateId: ExamTemplateId;
  /** Fixed width in px; height follows A4 ratio. Omit for 100% of parent width. */
  width?: number;
}

export function TemplateThumbnail({ templateId, width }: TemplateThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.12);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / A4_WIDTH_PX);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: width ?? "100%",
        aspectRatio: A4_ASPECT_RATIO,
        overflow: "hidden",
        bgcolor: "grey.100",
        position: "relative",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "210mm",
          transformOrigin: "top right",
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
      >
        {renderExamTemplate(templateId, SAMPLE_PRINT_EXAM, {
          schoolName: "مدرسه نمونه",
          className: "۶/۱",
          courseName: "ریاضی",
        })}
      </Box>
    </Box>
  );
}

export default function TemplatePicker({ selected, onSelect, hideTitle = false }: TemplatePickerProps) {
  return (
    <Box>
      {!hideTitle && (
        <>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            انتخاب قالب برگه
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            روی هر قالب کلیک کنید تا انتخاب شود.
          </Typography>
        </>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        {EXAM_TEMPLATES.map((template) => {
          const isSelected = selected === template.id;
          return (
            <Card
              key={template.id}
              variant="outlined"
              sx={{
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? "primary.main" : "divider",
              }}
            >
              <CardActionArea onClick={() => onSelect(template.id)}>
                <TemplateThumbnail templateId={template.id} />
                <Box sx={{ p: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {template.label}
                    </Typography>
                    {isSelected ? (
                      <CheckCircleIcon color="primary" sx={{ fontSize: 16 }} />
                    ) : null}
                  </Box>
                  <Chip
                    label={template.levelLabel}
                    size="small"
                    color={LEVEL_COLORS[template.level] ?? "default"}
                    sx={{ mb: 0.5, height: 20, fontSize: "0.7rem" }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4 }}>
                    {template.description}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
