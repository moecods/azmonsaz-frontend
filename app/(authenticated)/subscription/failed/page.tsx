"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
export default function SubscriptionFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'پرداخت ناموفق بود';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CancelIcon sx={{ fontSize: 80, color: 'error.main' }} />
              <Typography variant="h5">پرداخت ناموفق</Typography>
              <Typography color="text.secondary" textAlign="center">
                {decodeURIComponent(error)}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => router.push('/subscription')}>
                  تلاش مجدد
                </Button>
                <Button variant="contained" onClick={() => router.push('/dashboard')}>
                  بازگشت به داشبورد
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
    </Box>
  );
}
