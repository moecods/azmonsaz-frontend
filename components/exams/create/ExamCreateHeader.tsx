"use client";

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Breadcrumb from "@/components/Breadcrumb";

interface ExamCreateHeaderProps {
  isEdit: boolean;
  partnerName?: string | null;
  onBack: () => void;
}

export function ExamCreateHeader({ isEdit, partnerName, onBack }: ExamCreateHeaderProps) {
  const theme = useTheme();

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Breadcrumb
          items={[
            { label: "مدیریت آزمون‌ها", href: "/exams" },
            { label: isEdit ? "ویرایش آزمون" : "ایجاد آزمون" },
          ]}
        />
        <Button size="small" variant="text" startIcon={<ArrowBackIcon />} onClick={onBack}>
          لیست آزمون‌ها
        </Button>
      </Stack>

      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 55%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {isEdit ? <EditIcon /> : <AddCircleOutlineIcon />}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              {isEdit ? "ویرایش آزمون" : "ساخت آزمون جدید"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {isEdit
                ? "تنظیمات آزمون را به‌روزرسانی کنید و در پایان ذخیره نمایید."
                : "در چند مرحله آزمون را تعریف کنید؛ بعداً سوالات را اضافه می‌کنید."}
            </Typography>
            {partnerName && (
              <Chip
                size="small"
                label={`شریک: ${partnerName}`}
                sx={{ mt: 1 }}
                variant="outlined"
              />
            )}
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
