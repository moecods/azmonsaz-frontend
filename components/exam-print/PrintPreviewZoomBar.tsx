"use client";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

interface PrintPreviewZoomBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitWidth: () => void;
  onFullscreen?: () => void;
}

function clampZoom(value: number): number {
  return Math.min(2, Math.max(0.35, Math.round(value * 100) / 100));
}

export function getNextZoom(current: number, direction: "in" | "out"): number {
  const idx = ZOOM_PRESETS.findIndex((z) => z >= current - 0.001);
  const base = idx === -1 ? ZOOM_PRESETS.length - 1 : idx;
  if (direction === "in") {
    return ZOOM_PRESETS[Math.min(base + 1, ZOOM_PRESETS.length - 1)];
  }
  return ZOOM_PRESETS[Math.max(base - 1, 0)];
}

export default function PrintPreviewZoomBar({
  zoom,
  onZoomChange,
  onFitWidth,
  onFullscreen,
}: PrintPreviewZoomBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        flexWrap: "wrap",
        mb: 1,
      }}
    >
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          پیش‌نمایش چاپ
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
          خط‌چین نارنجی: ادامه در صفحه بعد
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        <Tooltip title="کوچک‌تر">
          <span>
            <IconButton
              size="small"
              aria-label="کوچک‌تر"
              onClick={() => onZoomChange(getNextZoom(zoom, "out"))}
              disabled={zoom <= ZOOM_PRESETS[0]}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: "center", fontWeight: 600 }}>
          {Math.round(zoom * 100)}٪
        </Typography>
        <Tooltip title="بزرگ‌تر">
          <span>
            <IconButton
              size="small"
              aria-label="بزرگ‌تر"
              onClick={() => onZoomChange(getNextZoom(zoom, "in"))}
              disabled={zoom >= ZOOM_PRESETS[ZOOM_PRESETS.length - 1]}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="جا شدن در عرض">
          <IconButton size="small" aria-label="جا شدن در عرض" onClick={onFitWidth}>
            <FitScreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="اندازه واقعی (۱۰۰٪)">
          <IconButton size="small" aria-label="اندازه واقعی" onClick={() => onZoomChange(1)}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {onFullscreen ? (
          <Tooltip title="نمایش تمام‌صفحه">
            <IconButton size="small" aria-label="نمایش تمام‌صفحه" onClick={onFullscreen}>
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  );
}

export { clampZoom };
