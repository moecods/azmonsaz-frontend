"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    // Refresh user data to get new subscription
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-refresh'));
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h5">اشتراک Pro با موفقیت فعال شد</Typography>
              <Typography color="text.secondary" textAlign="center">
                اکنون می‌توانید از تصحیح خودکار با هوش مصنوعی استفاده کنید.
              </Typography>
              <Button variant="contained" onClick={() => router.push('/dashboard')}>
                بازگشت به داشبورد
              </Button>
            </Stack>
          </CardContent>
        </Card>
    </Box>
  );
}
