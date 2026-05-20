"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8030/api';
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const PLANS = [
  { id: 'pro_1month', name: '۱ ماهه', price: 200_000, duration: '۳۰ روز' },
  { id: 'pro_3months', name: '۳ ماهه', price: 500_000, duration: '۹۰ روز', popular: true },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const hasPro = !!user?.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/subscriptions/checkout`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطا در ایجاد پرداخت');
      if (data.data?.redirect_url) {
        window.location.href = data.data.redirect_url;
      } else {
        setError('لینک پرداخت دریافت نشد');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ارتباط با سرور');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Breadcrumb items={[{ label: 'اشتراک Pro' }]} />
        <Typography variant="h4">اشتراک Pro</Typography>
        <Typography color="text.secondary">
          با اشتراک Pro از تصحیح خودکار با هوش مصنوعی استفاده کنید
        </Typography>

        {hasPro && (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            اشتراک Pro شما تا {user?.subscription?.ends_at && new Date(user.subscription.ends_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })} فعال است.
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {PLANS.map((plan) => (
            <Card key={plan.id} sx={{ flex: 1, position: 'relative' }}>
              {plan.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 12,
                  }}
                >
                  محبوب
                </Box>
              )}
              <CardActionArea onClick={() => !hasPro && handleCheckout(plan.id)} disabled={!!loading || hasPro}>
                <CardContent sx={{ pt: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {plan.price.toLocaleString('fa-IR')} تومان
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {plan.duration}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={!!loading || hasPro}
                    startIcon={loading === plan.id ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {hasPro ? 'فعال' : loading === plan.id ? 'در حال انتقال...' : 'خرید'}
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Stack>
    </>
  );
}
