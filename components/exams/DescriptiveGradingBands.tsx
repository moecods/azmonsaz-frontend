"use client";

import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  type DescriptiveGradingBand,
  type DescriptiveGradingConfig,
  formatDescriptiveBandLine,
} from "@/lib/grading";

interface DescriptiveGradingBandsProps {
  value: DescriptiveGradingConfig;
  onChange: (config: DescriptiveGradingConfig) => void;
}

export function DescriptiveGradingBands({ value, onChange }: DescriptiveGradingBandsProps) {
  const updateBand = (index: number, patch: Partial<DescriptiveGradingBand>) => {
    const bands = value.bands.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange({ ...value, bands });
  };

  const addBand = () => {
    onChange({
      ...value,
      bands: [...value.bands, { label: "پانگ جدید", min: 0, max: value.scale_max }],
    });
  };

  const removeBand = (index: number) => {
    if (value.bands.length <= 1) return;
    onChange({
      ...value,
      bands: value.bands.filter((_, i) => i !== index),
    });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        بازه‌های نمره توصیفی را تنظیم کنید. نمره نهایی شرکت‌کننده (مثلاً از ۲۰) در بازه مناسب قرار می‌گیرد و
        همان برچسب در نتیجه آزمون نمایش داده می‌شود.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          type="number"
          label="حداکثر نمره (مقیاس)"
          value={value.scale_max}
          onChange={(e) =>
            onChange({ ...value, scale_max: Math.max(1, Number(e.target.value) || 20) })
          }
          inputProps={{ min: 1, max: 100 }}
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          label="حداقل نمره قبولی"
          value={value.pass_min}
          onChange={(e) =>
            onChange({ ...value, pass_min: Math.max(0, Number(e.target.value) || 0) })
          }
          inputProps={{ min: 0, max: value.scale_max }}
          sx={{ flex: 1 }}
          helperText="مثلاً ۱۰ برای «قابل قبول»"
        />
      </Stack>

      <Stack spacing={1.5}>
        {value.bands.map((band, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="caption" color="text.secondary">
                {formatDescriptiveBandLine(band, value.scale_max)}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
                <TextField
                  label="از نمره"
                  type="number"
                  size="small"
                  value={band.min}
                  onChange={(e) => updateBand(index, { min: Number(e.target.value) })}
                  inputProps={{ min: 0, max: value.scale_max, step: 0.5 }}
                  sx={{ width: { xs: "100%", sm: 100 } }}
                />
                <TextField
                  label="تا نمره"
                  type="number"
                  size="small"
                  value={band.max ?? value.scale_max}
                  onChange={(e) => updateBand(index, { max: Number(e.target.value) })}
                  inputProps={{ min: 0, max: value.scale_max, step: 0.5 }}
                  sx={{ width: { xs: "100%", sm: 100 } }}
                />
                <TextField
                  label="عنوان (توصیفی)"
                  size="small"
                  value={band.label}
                  onChange={(e) => updateBand(index, { label: e.target.value })}
                  sx={{ flex: 1, minWidth: 160 }}
                />
                <IconButton
                  color="error"
                  onClick={() => removeBand(index)}
                  disabled={value.bands.length <= 1}
                  aria-label="حذف پانگ"
                  sx={{ mt: { sm: 0.5 } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addBand}>
        افزودن پانگ
      </Button>
    </Stack>
  );
}
