"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { takeExamPageSx } from "./take-exam-styles";

interface TakeExamSuccessProps {
  result: {
    passed?: boolean;
    score?: number;
    total_points?: number;
    outcome_label?: string;
    scaled_score?: number;
    result_visibility?: { visible?: boolean; message?: string };
  };
  onBack: () => void;
  onViewResult: () => void;
}

export function TakeExamSuccess({ result, onBack, onViewResult }: TakeExamSuccessProps) {
  const resultVisible = result.result_visibility?.visible !== false;
  const resultMessage = result.result_visibility?.message;

  return (
    <Card sx={{ ...takeExamPageSx.card, maxWidth: 520, mx: "auto", mt: { xs: 2, md: 6 } }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 72, color: "success.main" }} />
          <Typography variant="h5" fontWeight={800}>
            آزمون با موفقیت ارسال شد
          </Typography>

          {resultVisible ? (
            <>
              <Typography variant="body1" color="text.secondary">
                {result.passed
                  ? "به حد نصاب رسیدید."
                  : "پاسخ‌های شما ثبت شد. نتیجه پس از انتشار در دسترس است."}
              </Typography>
              <Box>
                {result.outcome_label ? (
                  <>
                    <Chip label={result.outcome_label} color="primary" sx={{ fontSize: "1rem", py: 2.5 }} />
                    {result.scaled_score != null && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        نمره: {result.scaled_score}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight={700}>
                      {result.score} از {result.total_points}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      درصد:{" "}
                      {result.total_points && result.total_points > 0 && result.score != null
                        ? Math.round((result.score / result.total_points) * 100)
                        : 0}
                      ٪
                    </Typography>
                  </>
                )}
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ width: "100%", borderRadius: 2 }}>
              {resultMessage || "نتیجه پس از برآورده شدن شرایط انتشار در دسترس خواهد بود."}
            </Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%" }}>
            <Button variant="outlined" fullWidth onClick={onBack}>
              بازگشت به آزمون‌ها
            </Button>
            <Button variant="contained" fullWidth onClick={onViewResult}>
              {resultVisible ? "مشاهده کارنامه" : "وضعیت نتیجه"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
