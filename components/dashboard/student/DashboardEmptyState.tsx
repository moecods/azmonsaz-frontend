"use client";

import { Box, Button, Card, Stack, Typography } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useRouter } from "next/navigation";

export default function DashboardEmptyState() {
  const router = useRouter();

  return (
    <Card
      variant="outlined"
      sx={{
        py: { xs: 4, md: 6 },
        px: 2,
        textAlign: "center",
        bgcolor: "action.hover",
      }}
    >
      <Stack spacing={2} alignItems="center" maxWidth={400} mx="auto">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            color: "primary.main",
          }}
        >
          <SchoolOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          هنوز در آزمونی ثبت‌نام نکرده‌اید
        </Typography>
        <Typography variant="body2" color="text.secondary">
          وقتی معلم شما را در آزمون ثبت‌نام کند یا لینک شرکت در آزمون را دریافت کنید، اینجا آزمون‌ها و
          کارهای مهم شما نمایش داده می‌شود.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/exams/available")}>
          رفتن به آزمون‌های من
        </Button>
      </Stack>
    </Card>
  );
}
