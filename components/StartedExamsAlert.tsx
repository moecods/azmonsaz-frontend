"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAvailableExams } from '@/hooks';

const ALERT_STORAGE_KEY = 'started_exams_alert_dismissed';
const REFRESH_INTERVAL = 30000; // 30 seconds

export default function StartedExamsAlert() {
  const router = useRouter();
  const { data: availableExamsData } = useAvailableExams();
  const [dismissed, setDismissed] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Check if alert was dismissed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedValue = localStorage.getItem(ALERT_STORAGE_KEY);
      if (dismissedValue === 'true') {
        setDismissed(true);
      }
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ALERT_STORAGE_KEY, 'true');
    }
  };

  // Get started exams
  const startedExams = (() => {
    const availableExamsDataValue = availableExamsData?.data;
    const availableExams = Array.isArray(availableExamsDataValue) 
      ? availableExamsDataValue 
      : availableExamsDataValue && typeof availableExamsDataValue === 'object' 
      ? Object.values(availableExamsDataValue) 
      : [];
    
    return availableExams.filter((exam: any) => exam.status === 'started');
  })();

  if (dismissed || startedExams.length === 0) {
    return null;
  }

  return (
    <Collapse in={!dismissed && startedExams.length > 0}>
      <Alert
        severity="warning"
        sx={{
          mb: 2,
          '& .MuiAlert-action': {
            alignItems: 'flex-start',
            pt: 1,
          },
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>آزمون‌های در حال برگزاری</AlertTitle>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {startedExams.map((exam: any) => (
            <Box
              key={exam.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                  {exam.title || `آزمون ${exam.id}`}
                </Typography>
                {exam.meta?.duration_minutes && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      مدت زمان: {exam.meta.duration_minutes} دقیقه
                    </Typography>
                  </Stack>
                )}
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={() => router.push(`/exams/take/${exam.id}`)}
                sx={{ ml: 2 }}
              >
                ادامه آزمون
              </Button>
            </Box>
          ))}
        </Stack>
      </Alert>
    </Collapse>
  );
}
